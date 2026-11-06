from flask import Flask, request, jsonify, Response, send_file , session
from extensions import db
from models import User, Doctor, Appointment, Treatment, Department, DoctorAvailability
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, date, timedelta
import csv,io
from io import StringIO
from flask_caching import Cache
from celery.result import AsyncResult
from werkzeug.utils import secure_filename
import os
from sqlalchemy import or_, text, and_

app = Flask(__name__)
app.secret_key = ""

# ================= CONFIG =================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Redis is mandatory for final project, but we fallback to SimpleCache if server is down for testing
try:
    import redis
    r = redis.from_url('redis://localhost:6379/0', socket_connect_timeout=1)
    r.ping()
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
except Exception as e:
    print(f"[CACHE WARNING] Redis connection failed: {e}. Using SimpleCache.")
    app.config['CACHE_TYPE'] = 'SimpleCache'

app.config['CACHE_DEFAULT_TIMEOUT'] = 300

app.config['CELERY_BROKER_URL']    = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

app.config["GOOGLE_CHAT_WEBHOOK_URL"] = ""
# Email config for monthly reports
app.config['MAIL_SERVER']   = 'smtp.gmail.com'
app.config['MAIL_PORT']     = 587
app.config['MAIL_USE_TLS']  = True
app.config['MAIL_USERNAME'] = ''          
app.config['MAIL_PASSWORD'] = ''       
app.config['MAIL_SENDER']   = 'SehatSaathi <24F2005064@ds.study.iitm.ac.in>'


app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # True only for HTTPS

cache = Cache(app)
db.init_app(app)


# ================= CELERY =================
from celery_app import make_celery
celery = make_celery(app)


# ================= HELPERS =================
UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DOCTOR_PHOTO_FOLDER = os.path.join("static", "uploads", "doctor_photos")
ALLOWED_EXTENSIONS  = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

def get_photo_url(photo):
    if not photo or photo == 'default_doctor.png':
        return '/static/images/default-doctor.png'
    # If it's already a full path
    if photo.startswith('/static/') or photo.startswith('http'):
        return photo
    return f'/static/uploads/{photo}'


def normalize_slot(s):
    if not s: return ""
    # 1. Normalize all variations of dashes (en-dash, em-dash) to a standard hyphen
    s = s.replace("–", "-").replace("—", "-")
    # 2. Ensure " - " formatting for consistency (space-hyphen-space)
    if "-" in s:
        parts = [p.strip() for p in s.split("-")]
        s = " - ".join(parts)
    # 3. Collapse multiple spaces and trim
    return " ".join(s.split()).strip()


def slot_sort_key(slot):
    if not slot: return 0
    s = normalize_slot(slot).upper()
    try:
        # Extract the first hour found in the string
        # handles "8:00 - 10:00 a.m." etc.
        hour_part = s.split(':')[0]
        h = int(hour_part.strip()[-2:] if len(hour_part.strip()) > 2 else hour_part.strip())
        # Hospital logic: 1-7 are PM (13-19), 8-12 are AM/Noon (8-12)
        if 1 <= h <= 7: h += 12
        m = 0
        if ':' in s:
            import re
            match = re.search(r':(\d+)', s)
            if match: m = int(match.group(1))
        return h * 60 + m
    except:
        return 0


def json_error(message, status=400):
    return jsonify({"error": message}), status


def get_json_data():
    data = request.get_json(silent=True)
    if not data:
        return None
    return data


def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return None, (jsonify({"error": "User not found"}), 404)
    if user.is_blocked:
        return None, (jsonify({"error": "User blocked"}), 403)
    return user, None

@app.route('/api/me')
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None}), 200

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'user': None}), 200

    return jsonify({
        'user': {
            'user_id': user.id,
            'name':    user.name,
            'email':   user.email,
            'role':    user.role
        }
    }), 200


def require_admin():
    user_id = session.get("user_id")
    user, err = get_user(user_id)
    if err:
        return None, err

    if user.role != "admin":
        return None, json_error("Unauthorized", 403)

    if user.is_blocked:
        return None, json_error("Admin is blocked", 403)

    return user, None

def get_doctor_by_user():
    user_id = session.get("user_id")
    user = db.session.get(User, user_id)
    if not user:
        return None, json_error("User not found", 404)
    if user.role != "doctor":
        return None, json_error("Only a doctor can perform this action", 403)
    doctor = Doctor.query.filter_by(user_id=user.id).first()
    if not doctor:
        return None, json_error("Doctor profile not found", 404)
    return doctor, None


# =========================================================
# ADMIN SERIALIZERS
# =========================================================
def serialize_doctor_admin(d):
    return {
        "id": d.id,
        "user_id": d.user.id if d.user else None,
        "name": d.user.name if d.user else "",
        "email": d.user.email if d.user else "",
        "phone": d.user.phone if d.user else "",
        "gender": d.user.gender if d.user else "",
        "age": d.user.age if d.user else "",
        "is_blocked": d.user.is_blocked if d.user else False,
        "specialization": d.specialization or "",
        "experience": d.experience or "",
        "qualification": d.qualification or "",
        "bio": d.bio or "",
        "fee": d.fee or 0,
        "license_no": d.license_no or "",
        "photo": get_photo_url(d.photo),
        "department_id": d.department_id,
        "department": d.department.name if d.department else ""
    }


def serialize_patient_admin(u):
    return {
        "id": u.id,
        "name": u.name or "",
        "email": u.email or "",
        "phone": u.phone or "",
        "gender": u.gender or "",
        "age": u.age or "",
        "is_blocked": u.is_blocked or False,
        "role": u.role
    }


# ================= STATIC ENTRY POINT =================
@app.route('/')
def home():
    return app.send_static_file('index.html')


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


# ================= AUTH =================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json

    if not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data.get('email')).first()
    if not user:
        return jsonify({"message": "No account found with this email"}), 404

    if user.is_blocked:
        return jsonify({"message": "Your account has been blocked. Contact admin."}), 403

    if not check_password_hash(user.password, data.get('password')):
        return jsonify({"message": "Incorrect password"}), 401
    
    session['user_id'] = user.id

    return jsonify({
        "user_id": user.id,
        "role":    user.role,
        "name":    user.name,
        "phone":   user.phone,
        "email":   user.email,
        "gender":  user.gender,
        "age":     user.age
    })



@app.route('/api/register', methods=['POST'])
def register():
    data = request.json

    # Required field check
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Name, email and password are required"}), 400

    # Email duplicate check
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "An account with this email already exists"}), 400

    # Age validation
    age = None
    if data.get('age'):
        try:
            age = int(data.get('age'))
            if age < 1 or age > 120:
                return jsonify({"error": "Please enter a valid age"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Age must be a number"}), 400

    user = User(
        name     = data.get('name'),
        email    = data.get('email'),
        phone    = data.get('phone', ''),
        gender   = data.get('gender', ''),
        age      = age,
        password = generate_password_hash(data.get('password')),
        role     = "patient"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Account created successfully"}), 201



# ================= PATIENT =================

from datetime import datetime, date, timedelta
from flask import request, jsonify
from sqlalchemy import or_

@app.route('/api/patient/<int:id>', methods=['GET', 'PUT'])
def patient_profile(id):
    user = db.session.get(User, id)

    if not user or user.role != "patient":
        return jsonify({"error": "Patient not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id,
            "name": user.name or "",
            "email": user.email or "",
            "phone": user.phone or "",
            "gender": user.gender or "",
            "age": user.age or ""
        })

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    gender = (data.get("gender") or "").strip()
    age = data.get("age")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    existing_user = User.query.filter(User.email == email, User.id != id).first()
    if existing_user:
        return jsonify({"error": "Email already in use"}), 400

    user.name = name
    user.email = email
    user.phone = phone
    user.gender = gender
    user.age = age if age not in ["", None] else None

    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200


@app.route('/api/departments')
@cache.cached(timeout=300)
def get_departments():
    departments = Department.query.order_by(Department.name.asc()).all()
    return jsonify([
        {
            "id": d.id,
            "name": d.name,
            "description": d.description or ""
        }
        for d in departments
    ])


@app.route('/api/doctors')
@cache.cached(timeout=300, query_string=True)
def get_doctors():
    dept_id = request.args.get('department_id', type=int)

    query = Doctor.query
    if dept_id:
        query = query.filter(Doctor.department_id == dept_id)

    doctors = query.all()

    return jsonify([
        {
            "id": d.id,
            "name": d.user.name if d.user else "",
            "specialization": d.specialization or "",
            "department": d.department.name if d.department else "",
            "photo": get_photo_url(d.photo),
            "fee": d.fee if d.fee is not None else 0
        }
        for d in doctors
    ])


@app.route('/api/search/doctors')
def search_doctors():
    q = (request.args.get("q") or "").strip()
    dept_id = request.args.get("department_id", type=int)

    query = Doctor.query.join(User).outerjoin(Department)

    if dept_id:
        query = query.filter(Doctor.department_id == dept_id)

    if q:
        query = query.filter(
            or_(
                User.name.ilike(f"%{q}%"),
                Doctor.specialization.ilike(f"%{q}%"),
                Department.name.ilike(f"%{q}%")
            )
        )

    doctors = query.all()

    return jsonify([
        {
            "id": d.id,
            "name": d.user.name if d.user else "",
            "specialization": d.specialization or "",
            "department": d.department.name if d.department else "",
            "photo": get_photo_url(d.photo),
        }
        for d in doctors
    ])


@app.route('/api/doctor/<int:id>')
def doctor_detail(id):
    d = db.session.get(Doctor, id)

    if not d:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify({
        "id": d.id,
        "name": d.user.name if d.user else "",
        "email": d.user.email if d.user else "",
        "phone": d.user.phone if d.user else "",
        "specialization": d.specialization or "",
        "qualification": getattr(d, "qualification", "") or "",
        "experience": getattr(d, "experience", "") or "",
        "fee": getattr(d, "fee", 0) or 0,
        "bio": getattr(d, "bio", "") or "",
        "department": d.department.name if d.department else "",
        "photo": get_photo_url(getattr(d, "photo", ""))
    })


@app.route('/api/doctor/availability/<int:doctor_id>')
def doctor_availability(doctor_id):
    today = date.today()
    next_7_days = today + timedelta(days=7)

    availabilities = DoctorAvailability.query.filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.date >= today,
        DoctorAvailability.date <= next_7_days
    ).order_by(DoctorAvailability.date.asc()).all()

    result = []
    for a in availabilities:
        norm_slot = normalize_slot(a.time_slot)
        already_booked = Appointment.query.filter(
            Appointment.doctor_id == doctor_id,
            Appointment.date == a.date,
            Appointment.slot == norm_slot, # check with normalized string
            Appointment.status.in_(["Booked", "Completed"])
        ).first()

        result.append({
            "id": a.id,
            "date": a.date.strftime("%Y-%m-%d"),
            "slot": norm_slot,
            "is_booked": bool(already_booked)
        })

    return jsonify(result)


@app.route('/api/appointments/patient/<int:id>')
def patient_appts(id):
    user = db.session.get(User, id)
    if not user or user.role != "patient":
        return jsonify({"error": "Patient not found"}), 404

    appts = Appointment.query.filter(
        Appointment.patient_id == id,
        Appointment.status != "Cancelled"
    ).order_by(Appointment.date.asc()).all()

    return jsonify([
        {
            "id": a.id,
            "doctor_id": a.doctor_id,
            "doctor_name": a.doctor.user.name if a.doctor and a.doctor.user else "",
            "department": a.doctor.department.name if a.doctor and a.doctor.department else "",
            "date": a.date.strftime("%Y-%m-%d"),
            "time": a.slot,
            "status": a.status,
            "diagnosis": a.treatment.diagnosis if getattr(a, "treatment", None) else "",
            "prescription": a.treatment.prescription if getattr(a, "treatment", None) else ""
        }
        for a in appts if a.status in ["Booked", "Completed"]
    ])


@app.route('/api/patient/history/<int:id>')
def patient_history(id):
    user = db.session.get(User, id)
    if not user or user.role != "patient":
        return jsonify({"error": "Patient not found"}), 404

    # Fetch all COMPLETED appointments for this patient
    appts = Appointment.query.filter_by(
        patient_id=id,
        status="Completed"
    ).order_by(Appointment.date.desc()).all()

    results = []
    for a in appts:
        t = a.treatment
        results.append({
            "id":             a.id, # for vue templates
            "appointment_id": a.id, # for API calls
            "doctor_name":  a.doctor.user.name if (a.doctor and a.doctor.user) else "Unknown",
            "department":   a.doctor.department.name if (a.doctor and a.doctor.department) else "General",
            "date":         a.date.strftime("%Y-%m-%d"),
            "time":         a.slot,
            "status":       a.status,
            "diagnosis":    t.diagnosis if t else "-",
            "prescription": t.prescription if t else "-",
            "medicines":    t.medicines if t else "-",
            "notes":        t.notes if t else "-"
        })

    return jsonify(results)



@app.route('/api/book', methods=['POST'])
def book():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    user, err = get_user(data.get("patient_id"))
    if err:
        return err

    if user.role != "patient":
        return jsonify({"error": "Only patients can book"}), 403

    doctor_id = data.get("doctor_id")
    slots = data.get("slots", [])

    if not doctor_id:
        return jsonify({"error": "Doctor ID is required"}), 400

    if not slots:
        return jsonify({"error": "No slots selected"}), 400

    for s in slots:
        if "||" not in s:
            return jsonify({"error": f"Invalid slot format: {s}"}), 400

        date_str, slot_raw = s.split("||")
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        slot = normalize_slot(slot_raw)

        available = DoctorAvailability.query.filter_by(
            doctor_id=doctor_id,
            date=date_obj,
            time_slot=slot
        ).first()
        
        # If not found, try raw slot match in case DB wasn't updated
        if not available:
             available = DoctorAvailability.query.filter_by(
                doctor_id=doctor_id,
                date=date_obj,
                time_slot=slot_raw.strip()
            ).first()

        if not available:
            return jsonify({"error": f"{slot} not available on {date_str}"}), 400

        existing = Appointment.query.filter_by(
            doctor_id=doctor_id,
            date=date_obj,
            slot=slot,
            status="Booked"
        ).first()

        if existing:
            return jsonify({"error": f"{slot} already booked on {date_str}"}), 400

        patient_conflict = Appointment.query.filter_by(
            patient_id=user.id,
            date=date_obj,
            slot=slot,
            status="Booked"
        ).first()

        if patient_conflict:
            return jsonify({"error": f"You already have another appointment at {slot} on {date_str}"}), 400

        available.is_booked = True
        db.session.add(Appointment(
            patient_id=user.id,
            doctor_id=doctor_id,
            date=date_obj,
            slot=slot,
            status="Booked",
            symptoms=(data.get("symptoms") or "").strip()
        ))

    db.session.commit()
    return jsonify({"message": "Appointment booked successfully"}), 201


@app.route('/api/appointment/reschedule/<int:id>', methods=['PUT'])
def reschedule(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    user, err = get_user(data.get("user_id"))
    if err:
        return err

    appointment = db.session.get(Appointment, id)
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    if appointment.patient_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    if appointment.status != "Booked":
        return jsonify({"error": "Only booked appointments can be rescheduled"}), 400

    date_value = data.get("date")
    new_slot = data.get("slot")

    if not date_value or not new_slot:
        return jsonify({"error": "Date and slot are required"}), 400

    new_date = datetime.strptime(date_value, "%Y-%m-%d").date()

    available = DoctorAvailability.query.filter_by(
        doctor_id=appointment.doctor_id,
        date=new_date,
        time_slot=new_slot
    ).first()

    if not available:
        return jsonify({"error": "Selected slot is not available"}), 400

    existing = Appointment.query.filter(
        Appointment.id != appointment.id,
        Appointment.doctor_id == appointment.doctor_id,
        Appointment.date == new_date,
        Appointment.slot == new_slot,
        Appointment.status == "Booked"
    ).first()

    if existing:
        return jsonify({"error": "Slot already booked"}), 400

    patient_conflict = Appointment.query.filter(
        Appointment.id != appointment.id,
        Appointment.patient_id == user.id,
        Appointment.date == new_date,
        Appointment.slot == new_slot,
        Appointment.status == "Booked"
    ).first()

    if patient_conflict:
        return jsonify({"error": "You already have another appointment at that time"}), 400

    appointment.date = new_date
    appointment.slot = new_slot

    db.session.commit()
    return jsonify({"message": "Appointment rescheduled successfully"}), 200


@app.route('/api/appointment/<int:id>', methods=['DELETE'])
def cancel(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    user, err = get_user(data.get("user_id"))
    if err:
        return err

    appt = db.session.get(Appointment, id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    if appt.patient_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    appt.status = "Cancelled"
    av = DoctorAvailability.query.filter_by(
        doctor_id=appt.doctor_id, date=appt.date, time_slot=appt.slot
    ).first()
    if av:
        av.is_booked = False
    db.session.commit()

    return jsonify({"message": "Appointment cancelled successfully"}), 200

# =========================================================
# PATIENT CSV EXPORT (Celery async)
# =========================================================
@app.route('/api/patient/export', methods=['POST'])
def patient_export_csv():
    data = request.get_json()
    user_id = session.get("user_id")

    if not user_id:
        return json_error("User ID is required")

    user, err = get_user(user_id)
    if err:
        return err

    if user.role != "patient":
        return json_error("Only patients can export", 403)

    from celery_app import export_csv_task
    task = export_csv_task.delay(user_id)

    return jsonify({
        "message": "Export started",
        "task_id": task.id
    }), 202


@app.route('/api/task-status/<task_id>')
def check_task_status(task_id):
    task = AsyncResult(task_id)

    if task.state == 'PENDING':
        return jsonify({"status": "pending"})
    elif task.state == 'SUCCESS':
        return jsonify({"status": "done", "filename": task.result})
    elif task.state == 'FAILURE':
        return jsonify({"status": "failed", "error": str(task.info)})
    else:
        return jsonify({"status": task.state.lower()})


# =========================
# DOCTOR MODULE
# =========================


@app.route("/api/doctor/dashboard/<int:user_id>")
def doctor_dashboard(user_id):
    doctor, err = get_doctor_by_user()
    if err:
        return err

    today    = date.today()
    week_end = today + timedelta(days=6)

    # ── All appointments for this doctor ──────────────────────
    appts_raw = Appointment.query.filter(
        Appointment.doctor_id == doctor.id
    ).order_by(Appointment.date.asc()).all()
    # Secondary sort by time in Python
    appts = sorted(appts_raw, key=lambda x: (x.date, slot_sort_key(x.slot)))

    today_count = 0
    week_count  = 0
    result      = []

    for a in appts:
        if a.date == today and a.status == "Booked":
            today_count += 1
        if today <= a.date <= week_end and a.status == "Booked":
            week_count += 1

        result.append({
            "appointment_id": a.id,
            "patient_id":     a.patient_id,
            "patient_name":   a.patient.name if a.patient else "",
            "date":           a.date.strftime("%Y-%m-%d") if a.date else "",
            "slot":           a.slot     or "",
            "symptoms":       a.symptoms or "",
            "status":         a.status
        })

    # ── Distinct patients who have booked this doctor ─────────
    patient_rows = db.session.execute(
        text("""
            SELECT DISTINCT
                u.id AS patient_id,
                u.name,
                u.gender,
                u.age,
                a.symptoms
            FROM appointment a
            JOIN user u ON u.id = a.patient_id
            WHERE a.doctor_id = :did AND a.status = 'Booked'
            ORDER BY u.name ASC
        """),
        {"did": doctor.id}
    ).fetchall()

    patients = [
        {
            "patient_id": r.patient_id,
            "name":       r.name,
            "gender":     r.gender,
            "age":        r.age,
            "symptoms":   r.symptoms
        }
        for r in patient_rows
    ]

    return jsonify({
        "doctor": {
            "doctor_id":      doctor.id,
            "user_id":        doctor.user_id,
            "name":           doctor.user.name          if doctor.user       else "",
            "specialization": doctor.specialization     or "",
            "department":     doctor.department.name    if doctor.department else "",
            "photo":          get_photo_url(doctor.photo),
            "bio":            doctor.bio                or "",
            "experience":     doctor.experience
        },
        "summary": {
            "today_booked":      today_count,
            "week_booked":       week_count,
            "assigned_patients": len(patients)
        },
        "appointments": result,
        "patients":     patients
    }), 200


# =============================================================
# 2. PUT  /api/doctor/profile/<user_id>
#    Update name, phone, specialization, experience, bio, photo
# =============================================================
@app.route("/api/doctor/profile/<int:user_id>", methods=["PUT"])
def update_doctor_profile(user_id):

    # Auth check
    session_uid = (
        session.get("user_id") or
        session.get("id")      or
        session.get("doctor_id")
    )
    if not session_uid:
        return jsonify({"error": "Unauthorized — please log in again"}), 401
    if str(session_uid) != str(user_id):
        return jsonify({"error": "Forbidden"}), 403

    # Form fields
    name           = (request.form.get("name",           "") or "").strip()
    phone          = (request.form.get("phone",          "") or "").strip()
    specialization = (request.form.get("specialization", "") or "").strip()
    experience_raw = (request.form.get("experience",     "") or "").strip()
    bio            = (request.form.get("bio",            "") or "").strip()

    if not name:
        return jsonify({"error": "Name cannot be empty"}), 400

    experience = int(experience_raw) if experience_raw.isdigit() else None

    # Photo upload
    photo_url = None
    if "photo" in request.files:
        file = request.files["photo"]
        if file and file.filename and allowed_file(file.filename):
            os.makedirs(DOCTOR_PHOTO_FOLDER, exist_ok=True)
            filename = secure_filename(f"doctor_{user_id}_{file.filename}")
            file.save(os.path.join(DOCTOR_PHOTO_FOLDER, filename))
            photo_url = f"/static/uploads/doctor_photos/{filename}"

    try:
        # Update User table (name + phone)
        db.session.execute(
            text("""
                UPDATE user
                SET    name  = :name,
                       phone = :phone
                WHERE  id = :uid
            """),
            {"name": name, "phone": phone, "uid": user_id}
        )

        # Update Doctor table (user_id is the FK, not id)
        if photo_url:
            db.session.execute(
                text("""
                    UPDATE doctor
                    SET    specialization = :spec,
                           experience     = :exp,
                           bio            = :bio,
                           photo          = :photo
                    WHERE  user_id = :uid
                """),
                {"spec": specialization, "exp": experience,
                 "bio": bio, "photo": photo_url, "uid": user_id}
            )
        else:
            db.session.execute(
                text("""
                    UPDATE doctor
                    SET    specialization = :spec,
                           experience     = :exp,
                           bio            = :bio
                    WHERE  user_id = :uid
                """),
                {"spec": specialization, "exp": experience,
                 "bio": bio, "uid": user_id}
            )

        db.session.commit()
        # Clear cache so dashboard and other views get latest data
        cache.clear()

        response = {
            "message":        "Profile updated successfully",
            "name":           name,
            "phone":          phone,
            "specialization": specialization,
            "experience":     experience,
            "bio":            bio,
        }
        if photo_url:
            response["photo_url"] = photo_url

        return jsonify(response), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# =============================================================
# 3. POST  /api/appointment/<id>/cancel-by-doctor
#    Doctor cancels a booked appointment
# =============================================================
@app.route("/api/appointment/<int:id>/cancel-by-doctor", methods=["POST"])
def cancel_appointment_by_doctor(id):
    data    = get_json_data()
    user_id = session.get("user_id")

    if not user_id:
        return json_error("User ID is required")

    doctor, err = get_doctor_by_user()
    if err:
        return err

    appt = db.session.get(Appointment, id)
    if not appt:
        return json_error("Appointment not found", 404)
    # Authorized doctor can update history
    if appt.status == "Completed":
        return json_error("Completed appointment cannot be cancelled")
    if appt.status == "Cancelled":
        return jsonify({"message": "Appointment already cancelled"}), 200

    appt.status = "Cancelled"
    db.session.commit()

    return jsonify({"message": "Appointment cancelled successfully"}), 200


# =============================================================
# 4. GET + POST  /api/treatment/<appointment_id>
#    GET  — fetch existing treatment details for an appointment
#    POST — save treatment and auto-mark appointment Completed
# =============================================================
@app.route("/api/treatment/<int:appointment_id>", methods=["GET", "POST"])
def treatment(appointment_id):
    appt = db.session.get(Appointment, appointment_id)
    if not appt:
        return json_error("Appointment not found", 404)

    # ── GET ──────────────────────────────────────────────────
    if request.method == "GET":
        user_id = session.get("user_id")
        if not user_id:
            return json_error("User ID is required")

        doctor, err = get_doctor_by_user()
        if err:
            return err
        if appt.doctor_id != doctor.id:
            return json_error("Unauthorized", 403)

        t = appt.treatment
        return jsonify({
            "appointment_id": appointment_id,
            "patient_name":   appt.patient.name if appt.patient else "",
            "date":           appt.date.strftime("%Y-%m-%d") if appt.date else "",
            "slot":           appt.slot     or "",
            "symptoms":       appt.symptoms or "",
            "status":         appt.status,
            "diagnosis":      t.diagnosis                                   if t else "",
            "prescription":   t.prescription                                if t else "",
            "notes":          t.notes                                       if t else "",
            "visit_type":     t.visit_type                                  if t else "",
            "test_done":      t.test_done                                   if t else "",
            "medicines":      t.medicines                                   if t else "",
            "next_visit":     t.next_visit.strftime("%Y-%m-%d")
                              if t and t.next_visit else ""
        }), 200

    # ── POST ─────────────────────────────────────────────────
    data    = get_json_data()
    user_id = session.get("user_id")
    if not user_id:
        return json_error("User ID is required")

    doctor, err = get_doctor_by_user()
    if err:
        return err
    # Authorized doctor can update history
    if appt.status == "Cancelled":
        return json_error("Cannot add treatment to a cancelled appointment")

    # Parse next_visit
    next_visit = None
    nv_raw = data.get("next_visit")
    if nv_raw:
        try:
            next_visit = datetime.strptime(nv_raw, "%Y-%m-%d").date()
        except ValueError:
            return json_error("Invalid next visit date format (use YYYY-MM-DD)")

    # Upsert treatment
    t = Treatment.query.filter_by(appointment_id=appointment_id).first()
    if not t:
        t = Treatment(appointment_id=appointment_id)

    t.diagnosis    = (data.get("diagnosis")    or "").strip()
    t.prescription = (data.get("prescription") or "").strip()
    t.notes        = (data.get("notes")        or "").strip()
    t.visit_type   = (data.get("visit_type")   or "").strip()
    t.test_done    = (data.get("test_done")    or "").strip()
    t.medicines    = (data.get("medicines")    or "").strip()
    t.next_visit   = next_visit

    db.session.add(t)

    # Auto-mark Completed
    if appt.status != "Completed":
        appt.status = "Completed"
        # Mark slot unavailable as requested
        av = DoctorAvailability.query.filter_by(
            doctor_id=doctor.id, date=appt.date, time_slot=appt.slot
        ).first()
        if av:
            av.is_booked = True

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Treatment saved and appointment marked as completed"
    }), 200


# =============================================================
# 5. GET  /api/patient/<patient_id>/history
#    Full treatment history for a patient across ALL doctors
# =============================================================
@app.route("/api/patient/<int:patient_id>/history", methods=["GET"])
def get_patient_history(patient_id):
    session_uid = session.get("user_id") or session.get("id")
    if not session_uid:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        rows = db.session.execute(
            text("""
                SELECT
                    a.id            AS appointment_id,
                    a.date,
                    a.slot,
                    a.symptoms,
                    a.status,
                    u.name          AS doctor_name,
                    d.specialization,
                    t.diagnosis,
                    t.prescription,
                    t.notes,
                    t.medicines
                FROM appointment a
                JOIN user      u ON u.id            = a.doctor_id
                JOIN doctor    d ON d.user_id        = a.doctor_id
                LEFT JOIN treatment t ON t.appointment_id = a.id
                WHERE a.patient_id = :pid
                ORDER BY a.date DESC, a.slot ASC
            """),
            {"pid": patient_id}
        ).fetchall()

        history = [
            {
                "appointment_id": r.appointment_id,
                "date":           str(r.date),
                "slot":           r.slot,
                "symptoms":       r.symptoms,
                "status":         r.status,
                "doctor_name":    r.doctor_name,
                "specialization": r.specialization,
                "diagnosis":      r.diagnosis,
                "prescription":   r.prescription,
                "notes":          r.notes,
                "medicines":      r.medicines
            }
            for r in rows
        ]

        return jsonify({"history": history}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================
# 6. POST  /api/doctor/availability
#    Add a new availability slot (next 7 days only)
# =============================================================
@app.route("/api/doctor/availability", methods=["POST"])
def add_availability():
    session_uid = session.get("user_id")
    if not session_uid:
        return json_error("Unauthorized — please log in again", 401)

    data = get_json_data()
    user_id = session.get("user_id") or session_uid
    date_str = data.get("date")
    slot = (data.get("slot") or "").strip()

    if not user_id:
        return json_error("User ID is required")
    if not date_str:
        return json_error("Date is required")
    if not slot:
        return json_error("Slot is required")

    doctor, err = get_doctor_by_user()
    if err:
        return err

    try:
        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return json_error("Invalid date format (use YYYY-MM-DD)")

    today = date.today()
    max_date = today + timedelta(days=6)

    if selected_date < today or selected_date > max_date:
        return json_error("Availability can only be added for the next 7 days")

    # Normalize slot string: standardized dashes and spacing
    slot = normalize_slot(slot)

    exists = DoctorAvailability.query.filter_by(
        doctor_id=doctor.id,
        date=selected_date,
        time_slot=slot
    ).first()

    if exists:
        if not exists.is_booked:
            return json_error("This slot is already available")
        # If it was booked/completed, we now make it available again as requested
        exists.is_booked = False
        db.session.commit()
        cache.clear()
        return jsonify({"message": "Slot is now available again"}), 200

    new_slot = DoctorAvailability(
        doctor_id=doctor.id,
        date=selected_date,
        time_slot=slot,
        is_booked=False
    )
    db.session.add(new_slot)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Availability added successfully"}), 201

@app.route("/api/doctor/my-availability")
def get_my_availability():
    user_id = session.get("user_id")
    if not user_id:
        return json_error("User ID is required")

    doctor, err = get_doctor_by_user()
    if err:
        return err

    today    = date.today()
    max_date = today + timedelta(days=6)

    slots_raw = DoctorAvailability.query.filter(
        DoctorAvailability.doctor_id == doctor.id,
        DoctorAvailability.date      >= today,
        DoctorAvailability.date      <= max_date
    ).order_by(DoctorAvailability.date.asc()).all()
    # Sort by time in Python
    slots = sorted(slots_raw, key=lambda x: (x.date, slot_sort_key(x.time_slot)))

    return jsonify([
        {
            "id":        s.id,
            "date":      s.date.strftime("%Y-%m-%d"),
            "slot":      s.time_slot,
            "is_booked": s.is_booked
        }
        for s in slots
    ]), 200



# =============================================================
# 8. DELETE  /api/doctor/availability/<availability_id>
#    Remove a slot only if no active booking exists on it
# =============================================================
@app.route("/api/doctor/availability/<int:availability_id>", methods=["DELETE"])
def delete_availability(availability_id):
    session_uid = session.get("user_id")
    if not session_uid:
        return json_error("Unauthorized — please log in again", 401)

    data = get_json_data()
    user_id = session.get("user_id") or session_uid


    if not user_id:
        return json_error("User ID is required")

    doctor, err = get_doctor_by_user()
    if err:
        return err

    av = db.session.get(DoctorAvailability, availability_id)
    if not av:
        return json_error("Availability slot not found", 404)
    if av.doctor_id != doctor.id:
        return json_error("Unauthorized", 403)

    booked = Appointment.query.filter_by(
        doctor_id=doctor.id,
        date=av.date,
        slot=av.time_slot,
        status="Booked"
    ).first()
    if booked:
        return json_error("Cannot delete a slot that is already booked")

    db.session.delete(av)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Availability slot deleted successfully"}), 200
@app.route("/api/doctor/availability/<int:availability_id>/clear", methods=["PUT"])
def clear_availability(availability_id):
    user_id = session.get("user_id")
    if not user_id:
        return json_error("Unauthorized", 401)

    doctor, err = get_doctor_by_user()
    if err: return err

    av = db.session.get(DoctorAvailability, availability_id)
    if not av: return json_error("Slot not found", 404)
    if av.doctor_id != doctor.id: return json_error("Unauthorized", 403)

    # Check if there's an active booking still
    active = Appointment.query.filter_by(
        doctor_id=doctor.id, date=av.date, slot=av.time_slot, status="Booked"
    ).first()
    if active:
        return json_error("Cannot clear a slot that is still actively booked. Cancel the appointment first.")

    av.is_booked = False
    db.session.commit()
    return jsonify({"message": "Slot made available again"}), 200

# =========================================================
# ADMIN DASHBOARD
# =========================================================
@app.route('/api/admin/dashboard')
def admin_dashboard():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    return jsonify({
        "doctors":      Doctor.query.count(),
        "patients":     User.query.filter_by(role="patient").count(),
        "appointments": Appointment.query.count(),
        "departments":  Department.query.count()
    }), 200


# =========================================================
# ADMIN LIST DOCTORS / PATIENTS
# =========================================================
@app.route('/api/admin/doctors')
def admin_doctors():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    doctors = Doctor.query.order_by(Doctor.id.desc()).all()
    return jsonify([serialize_doctor_admin(d) for d in doctors]), 200


@app.route('/api/admin/patients')
def admin_patients():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    patients = User.query.filter_by(role="patient").order_by(User.id.desc()).all()
    return jsonify([serialize_patient_admin(p) for p in patients]), 200


# =========================================================
# ADMIN SEARCH
# =========================================================
@app.route('/api/admin/search')
def admin_search():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    q      = (request.args.get("q")    or "").strip().lower()
    target = (request.args.get("type") or "all").strip().lower()

    doctor_results  = []
    patient_results = []

    if not q:
        return jsonify({"doctors": [], "patients": []}), 200

    if target in ["all", "doctor", "doctors"]:
        doctors = Doctor.query.order_by(Doctor.id.desc()).all()
        for d in doctors:
            values = [
                d.user.name         if d.user       else "",
                d.user.email        if d.user       else "",
                d.user.phone        if d.user       else "",
                d.specialization or "",
                d.qualification  or "",
                d.experience     or "",
                d.department.name   if d.department else "",
                str(d.id)
            ]
            searchable = " ".join([str(v).lower() for v in values if v is not None])
            if q in searchable:
                doctor_results.append(serialize_doctor_admin(d))

    if target in ["all", "patient", "patients"]:
        patients = User.query.filter_by(role="patient").order_by(User.id.desc()).all()
        for p in patients:
            values = [
                p.name   or "",
                p.email  or "",
                p.phone  or "",
                p.gender or "",
                str(p.id)
            ]
            searchable = " ".join([str(v).lower() for v in values if v is not None])
            if q in searchable:
                patient_results.append(serialize_patient_admin(p))

    return jsonify({"doctors": doctor_results, "patients": patient_results}), 200


# =========================================================
# ADMIN DOCTOR CRUD
# =========================================================
@app.route('/api/admin/doctor', methods=['POST'])
def create_doctor():
    admin, err = require_admin()
    if err:
        return err

    name           = (request.form.get("name")           or "").strip()
    email          = (request.form.get("email")          or "").strip().lower()
    phone          = (request.form.get("phone")          or "").strip()
    gender         = (request.form.get("gender")         or "NA").strip()
    age            =  request.form.get("age")            or 30
    password       =  request.form.get("password")
    specialization = (request.form.get("specialization") or "").strip()
    experience     = (request.form.get("experience")     or "").strip()
    qualification  = (request.form.get("qualification")  or "").strip()
    bio            = (request.form.get("bio")            or "").strip()
    fee            =  request.form.get("fee")            or 0
    department_id  =  request.form.get("department_id")
    license_no     = (request.form.get("license_no")     or "").strip()

    if not name or not email or not phone or not password or not specialization:
        return json_error("Name, email, phone, password and specialization are required")

    if User.query.filter_by(email=email).first():
        return json_error("Email already exists")

    photo_name = "default_doctor.png"
    file = request.files.get("photo")
    if file and file.filename:
        filename    = secure_filename(file.filename)
        unique_name = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_path   = os.path.join(UPLOAD_FOLDER, unique_name)
        file.save(file_path)
        photo_name  = unique_name

    user = User(
        name     = name,
        email    = email,
        phone    = phone,
        gender   = gender,
        age      = int(age),
        password = generate_password_hash(password),
        role     = "doctor"
    )
    db.session.add(user)
    db.session.flush()

    doctor = Doctor(
        user_id        = user.id,
        department_id  = int(department_id) if str(department_id or "").strip() else None,
        specialization = specialization,
        experience     = experience,
        qualification  = qualification,
        bio            = bio,
        fee            = int(fee) if str(fee or "").strip() else 0,
        license_no     = license_no or f"LIC-{user.id}",
        photo          = photo_name
    )
    db.session.add(doctor)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Doctor created successfully"}), 201


# FIX 3 — now accepts multipart/form-data so photo can be updated from edit-doctor page
@app.route('/api/admin/doctor/<int:id>', methods=['PUT'])
def update_doctor(id):
    # Support both JSON (no photo) and multipart form-data (with photo)
    is_form = request.content_type and 'multipart' in request.content_type
    data    = request.form if is_form else get_json_data()

    admin, err = require_admin()
    if err:
        return err

    d = db.session.get(Doctor, id)
    if not d:
        return json_error("Doctor not found", 404)

    name   = data.get("name")
    email  = data.get("email")
    phone  = data.get("phone")
    gender = data.get("gender")
    age    = data.get("age")

    if name   is not None: d.user.name   = name.strip()
    if phone  is not None: d.user.phone  = phone.strip()
    if gender is not None: d.user.gender = gender.strip()
    if age    is not None and str(age).strip():
        d.user.age = int(age)

    if email is not None:
        email = email.strip().lower()
        existing = User.query.filter(User.email == email, User.id != d.user_id).first()
        if existing:
            return json_error("Email already in use")
        d.user.email = email

    if data.get("specialization") is not None:
        d.specialization = data.get("specialization").strip()
    if data.get("experience") is not None:
        d.experience = data.get("experience").strip()
    if data.get("qualification") is not None:
        d.qualification = data.get("qualification").strip()
    if data.get("bio") is not None:
        d.bio = data.get("bio").strip()
    if data.get("fee") is not None and str(data.get("fee")).strip():
        d.fee = int(data.get("fee"))
    if "department_id" in data:
        dept_id = data.get("department_id")
        d.department_id = int(dept_id) if str(dept_id or "").strip() else None

    # FIX 3 continued — handle optional photo replacement
    if is_form:
        file = request.files.get("photo")
        if file and file.filename:
            filename    = secure_filename(file.filename)
            unique_name = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{filename}"
            file_path   = os.path.join(UPLOAD_FOLDER, unique_name)
            file.save(file_path)
            d.photo = unique_name

    db.session.commit()
    cache.clear()

    return jsonify({"message": "Doctor updated successfully"}), 200


@app.route('/api/admin/doctor/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    d = db.session.get(Doctor, id)
    if not d:
        return json_error("Doctor not found", 404)

    user = d.user
    db.session.delete(d)
    db.session.flush()
    if user:
        db.session.delete(user)

    db.session.commit()
    cache.clear()

    return jsonify({"message": "Doctor deleted successfully"}), 200


@app.route('/api/admin/doctor/block/<int:id>', methods=['PUT'])
def block_doc(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    d = db.session.get(Doctor, id)
    if not d:
        return json_error("Doctor not found", 404)

    d.user.is_blocked = not d.user.is_blocked
    db.session.commit()
    cache.clear()

    return jsonify({
        "message":    "Doctor status updated successfully",
        "is_blocked": d.user.is_blocked
    }), 200


# NEW 1 — Admin read-only view of a doctor's availability slots
@app.route('/api/admin/doctor/<int:doctor_id>/availability')
def admin_doctor_availability(doctor_id):
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    d = db.session.get(Doctor, doctor_id)
    if not d:
        return json_error("Doctor not found", 404)

    slots = DoctorAvailability.query \
        .filter_by(doctor_id=doctor_id) \
        .order_by(DoctorAvailability.date.asc()) \
        .all()

    return jsonify([
        {
            "id":   s.id,
            "date": s.date.strftime("%Y-%m-%d"),
            "slot": s.time_slot
        }
        for s in slots
    ]), 200


# =========================================================
# ADMIN PATIENT CRUD
# =========================================================
@app.route('/api/admin/patient/<int:id>', methods=['PUT'])
def update_patient(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    patient = db.session.get(User, id)
    if not patient or patient.role != "patient":
        return json_error("Patient not found", 404)

    name   = (data.get("name")   or "").strip()
    email  = (data.get("email")  or "").strip().lower()
    phone  = (data.get("phone")  or "").strip()
    gender = (data.get("gender") or "").strip()
    age    =  data.get("age")

    if not name or not email:
        return json_error("Name and email are required")

    existing = User.query.filter(User.email == email, User.id != patient.id).first()
    if existing:
        return json_error("Email already in use")

    patient.name   = name
    patient.email  = email
    patient.phone  = phone
    patient.gender = gender
    patient.age    = int(age) if str(age or "").strip() else None

    db.session.commit()
    cache.clear()

    return jsonify({"message": "Patient updated successfully"}), 200


@app.route('/api/admin/patient/<int:id>', methods=['DELETE'])
def delete_patient(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    u = db.session.get(User, id)
    if not u or u.role != "patient":
        return json_error("Patient not found", 404)

    db.session.delete(u)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Patient deleted successfully"}), 200


@app.route('/api/admin/patient/block/<int:id>', methods=['PUT'])
def block_patient(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    u = db.session.get(User, id)
    if not u or u.role != "patient":
        return json_error("Patient not found", 404)

    u.is_blocked = not u.is_blocked
    db.session.commit()
    cache.clear()

    return jsonify({
        "message":    "Patient status updated successfully",
        "is_blocked": u.is_blocked
    }), 200


# =========================================================
# ADMIN PATIENT HISTORY
# =========================================================
@app.route('/api/admin/patient-history/<int:patient_id>')
def admin_patient_history(patient_id):
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    patient = db.session.get(User, patient_id)
    if not patient or patient.role != "patient":
        return json_error("Patient not found", 404)

    appts = Appointment.query \
        .filter_by(patient_id=patient_id) \
        .order_by(Appointment.date.desc()) \
        .all()

    return jsonify([
        {
            "id":           a.id,
            "date":         a.date.strftime("%Y-%m-%d") if a.date else "",
            "slot":         a.slot or "",
            "status":       a.status,
            "doctor_name":  a.doctor.user.name       if a.doctor and a.doctor.user       else "",
            "department":   a.doctor.department.name if a.doctor and a.doctor.department else "",
            "diagnosis":    a.treatment.diagnosis    if a.treatment else "",
            "prescription": a.treatment.prescription if a.treatment else "",
            "notes":        a.treatment.notes        if a.treatment else ""
        }
        for a in appts if a.status == "Completed"
    ]), 200


# =========================================================
# ADMIN APPOINTMENTS — FIX 1 ("time" → "slot") + FIX 2 (filters)
# =========================================================
@app.route('/api/admin/appointments')
def admin_all_appointments():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    # FIX 2 — optional filter params
    status    = (request.args.get("status")    or "").strip()
    date_from = (request.args.get("date_from") or "").strip()
    date_to   = (request.args.get("date_to")   or "").strip()
    doctor_id = (request.args.get("doctor_id") or "").strip()

    query = Appointment.query

    if status:
        query = query.filter(Appointment.status == status)
    if date_from:
        query = query.filter(
            Appointment.date >= datetime.strptime(date_from, "%Y-%m-%d").date()
        )
    if date_to:
        query = query.filter(
            Appointment.date <= datetime.strptime(date_to, "%Y-%m-%d").date()
        )
    if doctor_id and doctor_id.isdigit():
        query = query.filter(Appointment.doctor_id == int(doctor_id))

    appts_raw = query.order_by(Appointment.date.desc()).all()
    appts = sorted(appts_raw, key=lambda x: (x.date), reverse=True)
    # Re-sort by time within each date
    appts = sorted(appts, key=lambda x: (x.date, slot_sort_key(x.slot)), reverse=True)

    return jsonify([
        {
            "id":           a.id,
            "patient_id":   a.patient_id,
            "patient_name": a.patient.name             if a.patient               else "",
            "doctor_id":    a.doctor_id,
            "doctor_name":  a.doctor.user.name         if a.doctor and a.doctor.user       else "",
            "department":   a.doctor.department.name   if a.doctor and a.doctor.department else "",
            "date":         a.date.strftime("%Y-%m-%d") if a.date else "",
            "slot":         a.slot or "",   # FIX 1 — was "time"
            "status":       a.status
        }
        for a in appts
    ]), 200


@app.route('/api/admin/appointment/<int:id>', methods=['PUT'])
def update_appointment_status(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    appt = db.session.get(Appointment, id)
    if not appt:
        return json_error("Appointment not found", 404)

    new_status = (data.get("status") or "").strip()
    if new_status not in ["Booked", "Completed", "Cancelled"]:
        return json_error("Invalid appointment status")

    appt.status = new_status
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Appointment updated successfully"}), 200


# =========================================================
# DEPARTMENT CRUD
# =========================================================
@app.route("/api/admin/departments")
def get_departments_admin():
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    departments = Department.query.order_by(Department.name.asc()).all()
    return jsonify([
        {
            "id":          d.id,
            "name":        d.name,
            "description": d.description or ""
        }
        for d in departments
    ]), 200


@app.route("/api/admin/departments", methods=["POST"])
def create_department():
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    name        = (data.get("name")        or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return json_error("Department name is required")

    if Department.query.filter_by(name=name).first():
        return json_error("Department already exists")

    dept = Department(name=name, description=description)
    db.session.add(dept)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Department created successfully"}), 201


@app.route("/api/admin/departments/<int:id>", methods=["PUT"])
def update_department(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    dept = db.session.get(Department, id)
    if not dept:
        return json_error("Department not found", 404)

    name        = (data.get("name")        or "").strip()
    description = (data.get("description") or "").strip()

    if not name:
        return json_error("Department name is required")

    existing = Department.query.filter(
        Department.name == name,
        Department.id   != id
    ).first()
    if existing:
        return json_error("Department name already exists")

    dept.name        = name
    dept.description = description
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Department updated successfully"}), 200


@app.route("/api/admin/departments/<int:id>", methods=["DELETE"])
def delete_department(id):
    data = get_json_data()
    admin, err = require_admin()
    if err:
        return err

    dept = db.session.get(Department, id)
    if not dept:
        return json_error("Department not found", 404)

    if Doctor.query.filter_by(department_id=id).first():
        return json_error("Cannot delete department with doctors assigned")

    db.session.delete(dept)
    db.session.commit()
    cache.clear()

    return jsonify({"message": "Department deleted successfully"}), 200


# =========================================================
# ADMIN CSV EXPORT  — NEW 2
# =========================================================
@app.route('/api/admin/export/<int:patient_id>')
def admin_export_patient(patient_id):
    user_id = session.get("user_id")
    admin, err = require_admin()
    if err:
        return err

    patient = db.session.get(User, patient_id)
    if not patient or patient.role != "patient":
        return json_error("Patient not found", 404)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Patient Name", "Doctor Name", "Department",
        "Date", "Slot", "Status",
        "Diagnosis", "Prescription", "Notes"
    ])

    appts = Appointment.query \
        .filter_by(patient_id=patient_id) \
        .order_by(Appointment.date.desc()) \
        .all()

    for a in appts:
        t    = a.treatment
        dept = a.doctor.department.name if a.doctor and a.doctor.department else ""
        writer.writerow([
            patient.name,
            a.doctor.user.name if a.doctor and a.doctor.user else "",
            dept,
            a.date.strftime("%Y-%m-%d") if a.date else "",
            a.slot or "",
            a.status,
            t.diagnosis    if t else "",
            t.prescription if t else "",
            t.notes        if t else ""
        ])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode("utf-8")),
        mimetype    = "text/csv",
        as_attachment = True,
        download_name = f"patient_{patient_id}_history.csv"
    )

@app.route("/api/admin/trigger-monthly-report", methods=["POST"])
def trigger_monthly_report():
    from celery_app import monthly_report
    task = monthly_report.delay()
    return jsonify({"message": "Monthly report triggered", "task_id": task.id}), 200


@app.route("/api/admin/trigger-daily-reminder", methods=["POST"])
def trigger_daily_reminder():
    from celery_app import send_daily_reminders
    task = send_daily_reminders.delay()
    return jsonify({"message": "Daily reminder triggered", "task_id": task.id}), 200


# ================= RUN =================
if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        if not User.query.filter_by(role="admin").first():
            admin = User(
                name="Admin",
                email="admin@hms.com",
                phone="0000000000",
                gender="NA",
                age=30,
                password=generate_password_hash("admin"),
                role="admin"
            )
            db.session.add(admin)
            db.session.commit()

    app.run(debug=True)
