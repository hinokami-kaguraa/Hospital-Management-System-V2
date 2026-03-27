from extensions import db
from datetime import datetime

# User
class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(100), nullable=False, unique=True, index=True)
    phone = db.Column(db.String(120), nullable=False)

    gender = db.Column(db.String(20), nullable=False)
    age = db.Column(db.Integer, nullable=False)

    password = db.Column(db.String(200), nullable=False)

    # Role - admin / doctor / patient
    role = db.Column(db.String(20), nullable=False, default="patient")

    # For blacklist
    is_blocked = db.Column(db.Boolean, default=False)

    # Relationships
    doctor_profile = db.relationship("Doctor", backref="user", uselist=False)
    patient_appointments = db.relationship("Appointment", backref="patient", lazy=True)


# Department
class Department(db.Model):
    __tablename__ = "department"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

    doctors = db.relationship("Doctor", backref="department", lazy=True)


# Doctor
class Doctor(db.Model):
    __tablename__ = "doctor"

    id = db.Column(db.Integer, primary_key=True)

    specialization = db.Column(db.String(200), nullable=False)
    experience = db.Column(db.String(100))
    qualification = db.Column(db.String(200))
    bio = db.Column(db.Text)

    fee = db.Column(db.Integer)
    photo = db.Column(db.String(300))

    license_no = db.Column(db.String(50), unique=True, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))

    appointments = db.relationship("Appointment", backref="doctor", lazy=True)
    availability = db.relationship("DoctorAvailability", backref="doctor", lazy=True)


# Appointment
class Appointment(db.Model):
    __tablename__ = "appointment"

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)
    slot = db.Column(db.String(50), nullable=False)

    symptoms = db.Column(db.String(500))

    status = db.Column(db.String(20), nullable=False, default="Booked")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    treatment = db.relationship("Treatment", backref="appointment", uselist=False)


# Treatment
class Treatment(db.Model):
    __tablename__ = "treatment"

    id = db.Column(db.Integer, primary_key=True)

    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'))

    visit_type = db.Column(db.String(50))
    test_done = db.Column(db.Text)
    medicines = db.Column(db.Text)

    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    notes = db.Column(db.Text)

    date_added = db.Column(db.DateTime, default=datetime.utcnow)


# Doctor Availability
class DoctorAvailability(db.Model):
    __tablename__ = "doctor_availability"

    id = db.Column(db.Integer, primary_key=True)

    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(50), nullable=False)

    # Prevent duplicate slots
    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'date', 'time_slot'),
    )