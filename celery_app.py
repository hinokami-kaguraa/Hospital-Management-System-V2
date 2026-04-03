from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
import csv, os
from io import StringIO


# ─────────────────────────────────────────────
#  CELERY FACTORY (IMPORTANT)
# ─────────────────────────────────────────────
def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
        backend=app.config.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    )

    celery.conf.update(app.config)

    # Auto Flask app context for all tasks
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery


# Import celery instance from app.py
from app import celery  # IMPORTANT (after factory to avoid circular import)


# ═══════════════════════════════════════════════
#  TASK 1 — DAILY REMINDER
#  Sends reminder for TODAY'S appointments
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.send_daily_reminders", max_retries=3)
def send_daily_reminders(self):
    from models import Appointment
    try:
        today = datetime.today().date()

        appointments = Appointment.query.filter_by(
            date=today,
            status="Booked"
        ).all()

        for appt in appointments:
            message = (
                f"Reminder: {appt.patient.name}, you have an appointment "
                f"with Dr. {appt.doctor.user.name} at {appt.slot} today."
            )

            # TODO: Replace with Email / SMS / Google Chat
            print(f"[REMINDER SENT] {message}")

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


# ═══════════════════════════════════════════════
#  TASK 2 — MONTHLY REPORT
#  Covers PREVIOUS MONTH (IMPORTANT FIX)
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.monthly_report", max_retries=3)
def monthly_report(self):
    from models import Appointment
    try:
        now = datetime.now()

        # Calculate previous month
        first_day_this_month = now.replace(day=1)
        last_day_last_month = first_day_this_month - timedelta(days=1)
        first_day_last_month = last_day_last_month.replace(day=1)

        month_label = last_day_last_month.strftime("%B %Y")

        completed = Appointment.query.filter(
            Appointment.date >= first_day_last_month.date(),
            Appointment.date <= last_day_last_month.date(),
            Appointment.status == "Completed"
        ).all()

        # Group by doctor
        doctors_data = {}

        for appt in completed:
            doc_id = appt.doctor_id

            if doc_id not in doctors_data:
                doctors_data[doc_id] = {
                    "doctor": appt.doctor.user.name,
                    "email": appt.doctor.user.email,
                    "appointments": []
                }

            doctors_data[doc_id]["appointments"].append({
                "patient": appt.patient.name,
                "date": str(appt.date),
                "slot": appt.slot,
                "diagnosis": appt.treatment.diagnosis if appt.treatment else "N/A",
                "prescription": appt.treatment.prescription if appt.treatment else "N/A"
            })

        print(f"[MONTHLY REPORT GENERATED] {month_label}")
        for doc in doctors_data.values():
            print(f"Doctor: {doc['doctor']} | Appointments: {len(doc['appointments'])}")

        # TODO: send email / generate HTML report

    except Exception as exc:
        raise self.retry(exc=exc, countdown=120)


# ═══════════════════════════════════════════════
#  TASK 3 — CSV EXPORT (PATIENT TRIGGERED)
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.export_csv_task", max_retries=3)
def export_csv_task(self, user_id):
    from models import Appointment
    try:
        output = StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Patient Name",
            "Doctor Name",
            "Department",
            "Date",
            "Time",
            "Symptoms",
            "Diagnosis",
            "Prescription",
            "Notes",
            "Next Visit"
        ])

        appointments = Appointment.query.filter_by(patient_id=user_id).all()

        for appt in appointments:
            t = appt.treatment

            writer.writerow([
                appt.patient.name,
                appt.doctor.user.name,
                appt.doctor.department.name if appt.doctor.department else "N/A",
                appt.date.strftime("%Y-%m-%d"),
                appt.slot,
                appt.symptoms or "",
                t.diagnosis if t else "",
                t.prescription if t else "",
                t.notes if t else "",
                t.next_visit.strftime("%Y-%m-%d") if (t and t.next_visit) else ""
            ])

        # Save file
        export_dir = os.path.join("static", "exports")
        os.makedirs(export_dir, exist_ok=True)

        filename = f"treatment_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(export_dir, filename)

        with open(filepath, "w", newline="") as f:
            f.write(output.getvalue())

        print(f"[CSV READY] {filepath}")

        return filename  # used by frontend to download

    except Exception as exc:
        raise self.retry(exc=exc, countdown=30)


# ═══════════════════════════════════════════════
#  CELERY BEAT SCHEDULE
# ═══════════════════════════════════════════════
celery.conf.beat_schedule = {
    "daily-reminder": {
        "task": "tasks.send_daily_reminders",
        "schedule": crontab(hour=8, minute=0),
    },
    "monthly-report": {
        "task": "tasks.monthly_report",
        "schedule": crontab(day_of_month=1, hour=9, minute=0),
    },
}

# Timezone (VERY IMPORTANT)
celery.conf.timezone = "Asia/Kolkata"