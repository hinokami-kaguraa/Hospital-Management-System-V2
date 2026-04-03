from flask import Flask, request, jsonify, Response, send_file
from extensions import db
from models import User, Doctor, Appointment, Treatment, Department, DoctorAvailability
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
import csv
from io import StringIO
from flask_caching import Cache
from celery.result import AsyncResult
from werkzeug.utils import secure_filename
import os


app = Flask(__name__)


# ================= CONFIG =================
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300

app.config['CELERY_BROKER_URL']    = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

cache = Cache(app)
db.init_app(app)


# ================= CELERY =================
from celery_app import make_celery
celery = make_celery(app)


# ================= HELPERS =================
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return None, (jsonify({"error": "User not found"}), 404)
    if user.is_blocked:
        return None, (jsonify({"error": "User blocked"}), 403)
    return user, None


def require_admin(user_id):
    user = User.query.get(user_id)
    if not user or user.role != "admin":
        return None, (jsonify({"error": "Admin only"}), 403)
    return user, None


# ================= STATIC ENTRY POINT =================
@app.route('/')
def home():
    return app.send_static_file('index.html')


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

    return jsonify({
        "user_id": user.id,
        "role":    user.role,
        "name":    user.name,
        "email":   user.email
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
@app.route('/api/patient/<int:id>', methods=['GET', 'PUT'])
def patient_profile(id):
    user = User.query.get(id)

    if not user or user.role != "patient":
        return jsonify({"error": "Patient not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "gender": user.gender,
            "age": user.age
        })

    data = request.json

    user.name = data.get("name")
    user.email = data.get("email")
    user.phone = data.get("phone")
    user.gender = data.get("gender")
    user.age = data.get("age")

    db.session.commit()

    return jsonify({"message": "Updated"})

@app.route('/api/departments')
@cache.cached(timeout=300)
def get_departments():
    return jsonify([
        {"id": d.id, "name": d.name, "description": d.description}
        for d in Department.query.all()
    ])


@app.route('/api/doctors')
@cache.cached(timeout=300, query_string=True)
def get_doctors():
    dept_id = request.args.get('department_id')

    doctors = Doctor.query.filter_by(department_id=dept_id).all() if dept_id else Doctor.query.all()

    return jsonify([
        {
            "id": d.id,
            "name": d.user.name,
            "specialization": d.specialization,
            "department": d.department.name if d.department else ""
        } for d in doctors
    ])

# ================= ADD THIS BELOW get_doctors =================
@app.route('/api/search/doctors')
def search_doctors():
    q = request.args.get("q", "")
    doctors = Doctor.query.join(User).filter(
        (User.name.ilike(f"%{q}%")) |
        (Doctor.specialization.ilike(f"%{q}%"))
    ).all()

    return jsonify([
        {"id": d.id, "name": d.user.name, "specialization": d.specialization}
        for d in doctors
    ])

@app.route('/api/doctor/<int:id>')
def doctor_detail(id):
    d = Doctor.query.get(id)
    if not d:
        return jsonify({"error": "Doctor not found"}), 404

    return jsonify({
        "id": d.id,
        "name": d.user.name,
        "email": d.user.email,
        "phone": d.user.phone,
        "specialization": d.specialization,
        "qualification": d.qualification,
        "experience": d.experience,
        "fee": d.fee,
        "bio": d.bio,
        "department": d.department.name if d.department else "",
        "photo": d.photo
    })


# ================= MODIFY THIS (PATIENT APPOINTMENTS) =================
@app.route('/api/appointments/patient/<int:id>')
def patient_appts(id):
    appts = Appointment.query.filter_by(patient_id=id).all()

    return jsonify([
        {
            "id": a.id,
            "doctor_name": a.doctor.user.name,
            "department": a.doctor.department.name if a.doctor.department else "",
            "date": a.date.strftime("%Y-%m-%d"),
            "time": a.slot,
            "status": a.status,
            "diagnosis": a.treatment.diagnosis if a.treatment else "",
            "prescription": a.treatment.prescription if a.treatment else ""
        } for a in appts
    ])


@app.route('/api/book', methods=['POST'])
def book():
    data = request.json

    user, err = get_user(data.get("patient_id"))
    if err: return err

    if user.role != "patient":
        return jsonify({"error": "Only patients can book"}), 403

    if not data.get('slots'):
        return jsonify({"error": "No slots provided"}), 400

    for s in data['slots']:
        date_str, slot = s.split("||")
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

        # availability check
        available = DoctorAvailability.query.filter_by(
            doctor_id=data['doctor_id'],
            date=date_obj,
            time_slot=slot
        ).first()

        if not available:
            return jsonify({"error": f"{slot} not available"}), 400

        # duplicate booking check
        if Appointment.query.filter_by(
            doctor_id=data['doctor_id'],
            date=date_obj,
            slot=slot
        ).first():
            return jsonify({"error": f"{slot} already booked"}), 400

        db.session.add(Appointment(
            patient_id=user.id,
            doctor_id=data['doctor_id'],
            date=date_obj,
            slot=slot
        ))

    db.session.commit()
    return jsonify({"message": "Booked"})


@app.route('/api/appointment/reschedule/<int:id>', methods=['PUT'])
def reschedule(id):
    data = request.json
    user, err = get_user(data.get("user_id"))
    if err: return err

    appointment = Appointment.query.get(id)
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    if appointment.patient_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    new_date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
    new_slot = data.get("slot")

    # availability check
    available = DoctorAvailability.query.filter_by(
        doctor_id=appointment.doctor_id,
        date=new_date,
        time_slot=new_slot
    ).first()

    if not available:
        return jsonify({"error": "Slot not available"}), 400

    existing = Appointment.query.filter_by(
        doctor_id=appointment.doctor_id,
        date=new_date,
        slot=new_slot
    ).first()

    if existing:
        return jsonify({"error": "Slot already booked"}), 400

    appointment.date = new_date
    appointment.slot = new_slot

    db.session.commit()
    return jsonify({"message": "Rescheduled"})


@app.route('/api/appointment/<int:id>', methods=['DELETE'])
def cancel(id):
    data = request.json
    user, err = get_user(data.get("user_id"))
    if err: return err

    appt = Appointment.query.get(id)
    if not appt:
        return jsonify({"error": "Appointment not found"}), 404

    appt.status = "Cancelled"
    db.session.commit()

    return jsonify({"message": "Cancelled"})


# ================= DOCTOR =================
# ================= MODIFY DOCTOR APPOINTMENTS =================
@app.route('/api/doctor/appointments/<int:id>')
def doctor_appts(id):
    appts = Appointment.query.filter_by(doctor_id=id).all()

    return jsonify([
        {
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": a.patient.name,
            "date": a.date.strftime("%Y-%m-%d"),
            "slot": a.slot,
            "status": a.status
        } for a in appts
    ])

@app.route('/api/appointment/<int:id>/complete', methods=['POST'])
def complete(id):
    data = request.json
    user, err = get_user(data.get("user_id"))
    if err: return err

    appt = Appointment.query.get(id)
    if not appt:
        return jsonify({"error": "Not found"}), 404

    if user.role != "doctor" or appt.doctor.user_id != user.id:
        return jsonify({"error": "Unauthorized"}), 403

    appt.status = "Completed"
    db.session.commit()
    return jsonify({"message": "done"})


@app.route('/api/treatment/<int:id>', methods=['GET', 'POST'])
def treatment(id):
    data = request.json or {}
    user_id = data.get("user_id")
    user, err = get_user(user_id) if user_id else (None, None)
    if user_id and err: return err

    appt = Appointment.query.get(id)
    if not appt:
        return jsonify({"error": "Not found"}), 404

    if request.method == 'GET':
        t = appt.treatment
        return jsonify({"diagnosis": t.diagnosis if t else ""})

    if appt.status != "Completed":
        return jsonify({"error": "Complete appointment first"}), 400

    t = Treatment.query.filter_by(appointment_id=id).first() or Treatment(appointment_id=id)

    t.diagnosis = data.get("diagnosis")
    t.prescription = data.get("prescription")
    t.notes = data.get("notes")

    db.session.add(t)
    db.session.commit()
    return jsonify({"message": "saved"})

# ================= ADD AVAILABILITY APIs =================
@app.route('/api/doctor/availability', methods=['POST'])
def add_availability():
    data = request.json

    date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
    slot = data.get("slot")

    if DoctorAvailability.query.filter_by(
        doctor_id=data.get("doctor_id"),
        date=date,
        time_slot=slot
    ).first():
        return jsonify({"error": "Already exists"}), 400

    db.session.add(DoctorAvailability(
        doctor_id=data.get("doctor_id"),
        date=date,
        time_slot=slot
    ))

    db.session.commit()
    return jsonify({"message": "Added"})


@app.route('/api/doctor/availability/<int:doctor_id>')
def get_availability(doctor_id):
    av = DoctorAvailability.query.filter_by(doctor_id=doctor_id).all()

    return jsonify([
        {
            "date": a.date.strftime("%Y-%m-%d"),
            "slot": a.time_slot
        } for a in av
    ])

# ================= ADMIN =================
@app.route('/api/admin/dashboard')
def admin_dashboard():
    user_id = request.args.get("user_id")
    admin, err = require_admin(user_id)
    if err: return err

    return jsonify({
        "doctors": Doctor.query.count(),
        "patients": User.query.filter_by(role="patient").count(),
        "appointments": Appointment.query.count()
    })


UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/api/admin/doctor', methods=['POST'])
def create_doctor():
    data = request.form

    admin, err = require_admin(data.get("user_id"))
    if err: return err

    # 🔥 FILE HANDLE
    file = request.files.get('photo')
    photo_path = ""

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        photo_path = "/" + file_path   # store path

    # USER
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        gender=data.get('gender'),
        age=data.get('age'),
        password=generate_password_hash(data['password']),
        role="doctor"
    )

    db.session.add(user)
    db.session.flush()

    # DOCTOR
    doctor = Doctor(
        user_id=user.id,
        department_id=data.get("department_id"),
        specialization=data.get("specialization"),
        experience=data.get("experience"),
        qualification=data.get("qualification"),
        fee=data.get("fee"),
        bio=data.get("bio"),
        license_no=f"LIC-{user.id}",
        photo=photo_path
    )

    db.session.add(doctor)
    db.session.commit()

    cache.clear()
    return jsonify({"message": "created"})


@app.route('/api/admin/doctor/<int:id>', methods=['PUT'])
def update_doctor(id):
    d = Doctor.query.get(id)
    if not d:
        return jsonify({"error": "Not found"}), 404

    data = request.json

    admin, err = require_admin(data.get("user_id"))
    if err: return err

    d.specialization = data.get("specialization")
    d.experience = data.get("experience")
    d.qualification = data.get("qualification")
    d.fee = data.get("fee")
    d.user.name = data.get("name")

    db.session.commit()
    cache.clear()

    return jsonify({"message": "updated"})


@app.route('/api/admin/doctor/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    d = Doctor.query.get(id)
    if not d:
        return jsonify({"error": "Doctor not found"}), 404

    db.session.delete(d.user)
    db.session.commit()

    cache.clear()
    return jsonify({"message": "deleted"})


@app.route('/api/admin/patient/<int:id>', methods=['DELETE'])
def delete_patient(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    u = User.query.get(id)
    if not u:
        return jsonify({"error": "Patient not found"}), 404

    db.session.delete(u)
    db.session.commit()

    cache.clear()
    return jsonify({"message": "deleted"})


@app.route('/api/admin/doctor/block/<int:id>', methods=['PUT'])
def block_doc(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    d = Doctor.query.get(id)
    if not d:
        return jsonify({"error": "Doctor not found"}), 404

    d.user.is_blocked = not d.user.is_blocked
    db.session.commit()
    return jsonify({"message": "done"})


@app.route('/api/admin/patient/block/<int:id>', methods=['PUT'])
def block_patient(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    u = User.query.get(id)
    if not u:
        return jsonify({"error": "Patient not found"}), 404

    u.is_blocked = not u.is_blocked
    db.session.commit()
    return jsonify({"message": "done"})


@app.route('/api/admin/appointments')
def admin_all_appointments():
    user_id = request.args.get("user_id")
    admin, err = require_admin(user_id)
    if err: return err

    appts = Appointment.query.all()

    return jsonify([
        {
            "id": a.id,
            "patient_name": a.patient.name,
            "doctor_name": a.doctor.user.name,
            "date": a.date.strftime("%Y-%m-%d"),
            "time": a.slot,
            "status": a.status
        } for a in appts
    ])


@app.route('/api/admin/appointment/<int:id>', methods=['PUT'])
def update_appointment_status(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    appt = Appointment.query.get(id)
    if not appt:
        return jsonify({"error": "Not found"}), 404

    appt.status = data.get("status")

    db.session.commit()
    return jsonify({"message": "updated"})


# ================= DEPARTMENT CRUD =================
@app.route("/api/admin/departments")
def get_departments_admin():
    user_id = request.args.get("user_id")
    admin, err = require_admin(user_id)
    if err: return err

    return jsonify([
        {"id": d.id, "name": d.name, "description": d.description}
        for d in Department.query.all()
    ])


@app.route("/api/admin/departments", methods=["POST"])
def create_department():
    data = request.json

    admin, err = require_admin(data.get("user_id"))
    if err: return err

    dept = Department(name=data.get("name"), description=data.get("description"))
    db.session.add(dept)
    db.session.commit()

    cache.clear()
    return jsonify({"message": "created"})


@app.route("/api/admin/departments/<int:id>", methods=["PUT"])
def update_department(id):
    dept = Department.query.get(id)
    if not dept:
        return jsonify({"error": "Not found"}), 404

    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    dept.name = data.get("name")
    dept.description = data.get("description")

    db.session.commit()
    cache.clear()

    return jsonify({"message": "updated"})


@app.route("/api/admin/departments/<int:id>", methods=["DELETE"])
def delete_department(id):
    data = request.json
    admin, err = require_admin(data.get("user_id"))
    if err: return err

    dept = Department.query.get(id)
    if not dept:
        return jsonify({"error": "Not found"}), 404

    db.session.delete(dept)
    db.session.commit()

    cache.clear()
    return jsonify({"message": "deleted"})


# ================= CSV EXPORT =================
@app.route("/api/admin/export/<int:user_id>")
def export_csv(user_id):
    admin_id = request.args.get("admin_id")

    admin, err = require_admin(admin_id)
    if err:
        return err

    task = celery.send_task(   # ✅ FIXED
        'tasks.export_csv_task',
        args=[user_id]
    )

    return jsonify({
        "message": "CSV export started",
        "task_id": task.id
    })


# ================= CSV RESULT FETCH =================
@app.route("/api/admin/export/result/<task_id>")
def get_export_result(task_id):
    task = AsyncResult(task_id, app=celery)   # ✅ FIXED

    if task.state == 'PENDING':
        return jsonify({"status": "Pending"})

    elif task.state == 'SUCCESS':
        filename = task.result

        filepath = os.path.join("static", "exports", filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        return send_file(filepath, as_attachment=True)  # ✅ FIXED

    elif task.state == 'FAILURE':
        return jsonify({"status": "Failed"}), 500

    return jsonify({"status": task.state})

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