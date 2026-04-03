from extensions import db
from datetime import datetime

# ─────────────────────────────────────────────
#  User
# ─────────────────────────────────────────────
class User(db.Model):
    __tablename__ = "user"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(100), nullable=False, unique=True, index=True)
    phone      = db.Column(db.String(15),  nullable=False)
    gender     = db.Column(db.String(20),  nullable=False)
    age        = db.Column(db.Integer,     nullable=False)
    password   = db.Column(db.String(200), nullable=False)

    role       = db.Column(
                    db.Enum('admin', 'doctor', 'patient', name='user_roles'),
                    nullable=False
                )

    is_blocked = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    doctor_profile = db.relationship(
        "Doctor", backref="user", uselist=False, cascade="all, delete-orphan"
    )

    appointments = db.relationship(
        "Appointment",
        foreign_keys="Appointment.patient_id",
        backref="patient",
        lazy=True
    )

    def __repr__(self):
        return f"<User {self.id} | {self.role} | {self.email}>"


# ─────────────────────────────────────────────
#  Department
# ─────────────────────────────────────────────
class Department(db.Model):
    __tablename__ = "department"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)

    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    doctors = db.relationship("Doctor", backref="department", lazy=True)

    @property
    def doctors_count(self):
        return len(self.doctors)

    def __repr__(self):
        return f"<Department {self.id} | {self.name}>"


# ─────────────────────────────────────────────
#  Doctor
# ─────────────────────────────────────────────
class Doctor(db.Model):
    __tablename__ = "doctor"

    id             = db.Column(db.Integer, primary_key=True)
    specialization = db.Column(db.String(200), nullable=False)
    experience     = db.Column(db.String(100))
    qualification  = db.Column(db.String(200))
    bio            = db.Column(db.Text)

    fee            = db.Column(db.Integer)
    photo          = db.Column(db.String(300), default="default_doctor.png")

    license_no     = db.Column(db.String(50),  unique=True, nullable=False)

    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id        = db.Column(db.Integer, db.ForeignKey('user.id'),       nullable=False)
    department_id  = db.Column(db.Integer, db.ForeignKey('department.id'))

    appointments = db.relationship(
        "Appointment", backref="doctor", lazy=True, cascade="all, delete-orphan"
    )

    availability = db.relationship(
        "DoctorAvailability", backref="doctor", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Doctor {self.id} | {self.specialization}>"


# ─────────────────────────────────────────────
#  Appointment
# ─────────────────────────────────────────────
class Appointment(db.Model):
    __tablename__ = "appointment"

    id         = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    doctor_id  = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False, index=True)

    date       = db.Column(db.Date, nullable=False, index=True)
    slot       = db.Column(db.String(20), nullable=False)

    symptoms   = db.Column(db.String(500))

    status     = db.Column(
                    db.Enum('Booked', 'Completed', 'Cancelled', name='appointment_status'),
                    default='Booked',
                    nullable=False
                )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    treatment = db.relationship(
        "Treatment",
        backref="appointment",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Prevent double booking
    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'date', 'slot', name='unique_doctor_slot'),
    )

    def __repr__(self):
        return f"<Appointment {self.id} | {self.date} {self.slot} | {self.status}>"


# ─────────────────────────────────────────────
#  Treatment
# ─────────────────────────────────────────────
class Treatment(db.Model):
    __tablename__ = "treatment"

    id             = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'), nullable=False)

    visit_type     = db.Column(db.String(50))
    test_done      = db.Column(db.Text)
    medicines      = db.Column(db.Text)

    diagnosis      = db.Column(db.Text)
    prescription   = db.Column(db.Text)
    notes          = db.Column(db.Text)

    next_visit     = db.Column(db.Date)

    date_added     = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def patient(self):
        return self.appointment.patient

    def __repr__(self):
        return f"<Treatment {self.id} | Appointment {self.appointment_id}>"


# ─────────────────────────────────────────────
#  Doctor Availability
# ─────────────────────────────────────────────
class DoctorAvailability(db.Model):
    __tablename__ = "doctor_availability"

    id        = db.Column(db.Integer, primary_key=True)

    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)

    date      = db.Column(db.Date, nullable=False, index=True)
    time_slot = db.Column(db.String(20), nullable=False)

    # Helps UI + prevents rebooking
    is_booked = db.Column(db.Boolean, default=False, nullable=False)

    # Prevent duplicate slots
    __table_args__ = (
        db.UniqueConstraint('doctor_id', 'date', 'time_slot', name='unique_availability_slot'),
    )

    def __repr__(self):
        return f"<Availability doctor={self.doctor_id} | {self.date} {self.time_slot} | booked={self.is_booked}>"