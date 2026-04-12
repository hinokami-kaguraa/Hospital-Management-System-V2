from app import app
from extensions import db
from models import Appointment, DoctorAvailability

def update_slots():
    with app.app_context():
        mapping = {
            "8-10": "8:00 - 10:00 a.m.",
            "10-12": "10:00 - 12:00 p.m.",
            "2-4": "2:00 - 4:00 p.m.",
            "4-6": "4:00 - 6:00 p.m.",
            "6-8": "6:00 - 8:00 p.m."
        }
        
        # Update Appointment slots
        appts = Appointment.query.all()
        for a in appts:
            if a.slot in mapping:
                a.slot = mapping[a.slot]
        
        # Update DoctorAvailability slots
        avs = DoctorAvailability.query.all()
        for av in avs:
            if av.time_slot in mapping:
                av.time_slot = mapping[av.time_slot]
        
        db.session.commit()
        print("Slots updated successfully in Database.")

if __name__ == "__main__":
    update_slots()
