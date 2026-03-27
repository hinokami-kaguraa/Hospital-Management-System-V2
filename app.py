from flask import Flask, request, jsonify
from extensions import db
from models import User, Doctor, Appointment
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hospital.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json

    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "No account found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    if user.is_blocked:
        return jsonify({"message": "User is blocked"}), 403

    return jsonify({
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role
    })

# Get Doctor
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()

    result = []
    for d in doctors:
        result.append({
            "id": d.id,
            "name": d.user.name,
            "specialization": d.specialization,
            "department": d.department.name if d.department else None
        })

    return jsonify(result)

# Book Appointment
@app.route('/api/book', methods=['POST'])
def book_appointment():
    data = request.json

    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')
    date_str = data.get('date')
    slot = data.get('slot')

    date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

    # Patient conflict
    patient_conflict = Appointment.query.filter_by(
        patient_id=patient_id,
        date=date_obj,
        slot=slot
    ).first()

    if patient_conflict:
        return jsonify({"message": "You already have appointment at this time"}), 400

    # Doctor conflict
    doctor_conflict = Appointment.query.filter_by(
        doctor_id=doctor_id,
        date=date_obj,
        slot=slot
    ).first()

    if doctor_conflict:
        return jsonify({"message": "Slot already booked"}), 400

    appt = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        date=date_obj,
        slot=slot,
        status="Booked"
    )

    db.session.add(appt)
    db.session.commit()

    return jsonify({"message": "Appointment booked successfully"})


def create_admin():
    existing = User.query.filter_by(email="admin@hms.com").first()
    if not existing:
        admin = User(
            name="Admin",
            email="admin@hms.com",
            phone="0000000000",
            gender="Male",
            age=25,
            password=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin created!")

def create_test_data():
    # Create patient
    existing_patient = User.query.filter_by(email="patient@test.com").first()
    if not existing_patient:
        patient = User(
            name="Test Patient",
            email="patient@test.com",
            phone="1234567890",
            gender="Male",
            age=22,
            password=generate_password_hash("123"),
            role="patient"
        )
        db.session.add(patient)

    # Create doctor
    existing_doctor = User.query.filter_by(email="doctor@test.com").first()
    if not existing_doctor:
        doctor_user = User(
            name="Dr Test",
            email="doctor@test.com",
            phone="9999999999",
            gender="Female",
            age=40,
            password=generate_password_hash("123"),
            role="doctor"
        )
        db.session.add(doctor_user)
        db.session.commit()

        doctor = Doctor(
            user_id=doctor_user.id,
            specialization="Cardiology",
            license_no="LIC123" 
        )
        db.session.add(doctor)

    db.session.commit()
    print("Test data created!")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_admin()
        #create_test_data()
    app.run(debug=True)