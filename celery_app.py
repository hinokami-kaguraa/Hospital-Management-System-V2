from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
import csv, os, smtplib, requests
from io import StringIO
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Initialize celery globally so it can be used for decorators
# We'll update its config later in app.py
celery = Celery("Hospital-Management-System-V2")

def send_google_chat_message(message_text):
    # We'll import app inside to get the config without circular import
    from app import app
    webhook_url = app.config.get("GOOGLE_CHAT_WEBHOOK_URL")
    if not webhook_url:
        print("[CHAT WEBHOOK ERROR] GOOGLE_CHAT_WEBHOOK_URL not configured")
        return False
    try:
        response = requests.post(
            webhook_url,
            json={"text": message_text},
            headers={"Content-Type": "application/json; charset=UTF-8"},
            timeout=10
        )
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"[CHAT WEBHOOK ERROR] {str(e)}")
        return False

def make_celery(app):
    celery.conf.update(
        broker_url=app.config.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
        result_backend=app.config.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# ═══════════════════════════════════════════════
#  TASK 1 — DAILY REMINDER
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.send_daily_reminders", max_retries=3)
def send_daily_reminders(self):
    from models import Appointment
    try:
        today = datetime.today().date()
        appointments = Appointment.query.filter_by(date=today, status="Booked").all()
        if not appointments:
            print("[DAILY REMINDER] No appointments for today")
            return

        lines = [f"📋 *Daily Appointment Reminders — {today.strftime('%d %b %Y')}*\n"]
        for appt in appointments:
            lines.append(f"• *{appt.patient.name}* → Dr. {appt.doctor.user.name} ({appt.doctor.specialization or 'General'}) at *{appt.slot}*")
        
        lines.append(f"\n_Total: {len(appointments)} appointment(s)_")
        message = "\n".join(lines)
        send_google_chat_message(message)
    except Exception as exc:
        raise self.retry(exc=exc)

# ═══════════════════════════════════════════════
#  TASK 2 — MONTHLY ACTIVITY REPORT
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.monthly_report")
def monthly_report(self):
    from models import Doctor, Appointment, Treatment
    from app import app
    try:
        today = datetime.today()
        first_day_this_month = today.replace(day=1)
        last_month_end = first_day_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        doctors = Doctor.query.all()
        for doctor in doctors:
            appts = Appointment.query.filter(
                Appointment.doctor_id == doctor.id,
                Appointment.status == 'Completed',
                Appointment.date >= last_month_start,
                Appointment.date <= last_month_end
            ).all()

            if not appts: continue

            # Build HTML Email
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">
                        Monthly Activity Report - {last_month_start.strftime('%B %Y')}
                    </h2>
                    <p>Hello Dr. <strong>{doctor.user.name}</strong>,</p>
                    <p>Here is a summary of your completed appointments for the last month:</p>
                    <table border='1' cellpadding='10' style='width: 100%; border-collapse: collapse; margin-top: 20px;'>
                        <thead>
                            <tr style='background-color: #f8f9fa;'>
                                <th style="text-align: left;">Patient</th>
                                <th style="text-align: left;">Date</th>
                                <th style="text-align: left;">Diagnosis</th>
                            </tr>
                        </thead>
                        <tbody>
            """
            for a in appts:
                t = Treatment.query.filter_by(appointment_id=a.id).first()
                diag = t.diagnosis if t else "N/A"
                html_content += f"<tr><td>{a.patient.name}</td><td>{a.date}</td><td>{diag}</td></tr>"
            
            html_content += """
                        </tbody>
                    </table>
                    <p style="margin-top: 30px;">Best Regards,<br><strong>SehatSaathi Team</strong></p>
                </div>
            </body>
            </html>
            """

            # Send Email via SMTP
            msg = MIMEMultipart()
            msg['From'] = app.config['MAIL_SENDER']
            msg['To'] = doctor.user.email
            msg['Subject'] = f"Monthly Activity Report - {last_month_start.strftime('%B %Y')}"
            msg.attach(MIMEText(html_content, 'html'))

            server = smtplib.SMTP(app.config['MAIL_SERVER'], app.config['MAIL_PORT'])
            if app.config.get('MAIL_USE_TLS'):
                server.starttls()
            server.login(app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'])
            server.send_message(msg)
            server.quit()
            
            print(f"[MONTHLY REPORT] Sent to {doctor.user.email}")
            
    except Exception as e:
        print(f"[MONTHLY REPORT ERROR] {str(e)}")

# ═══════════════════════════════════════════════
#  TASK 3 — EXPORT CSV
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.export_csv_task")
def export_csv_task(self, patient_id):
    from models import User, Appointment, Treatment
    try:
        patient = User.query.get(patient_id)
        if not patient:
            return "Patient not found"
            
        appts = Appointment.query.filter_by(patient_id=patient_id).all()
        
        # Create exports directory in static
        export_dir = os.path.join('static', 'exports')
        if not os.path.exists(export_dir):
            os.makedirs(export_dir)
            
        filename = f"export_{patient.name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(export_dir, filename)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Date', 'Doctor', 'Status', 'Diagnosis'])
            for a in appts:
                t = Treatment.query.filter_by(appointment_id=a.id).first()
                writer.writerow([a.date, a.doctor.user.name, a.status, t.diagnosis if t else 'N/A'])
        
        print(f"[CSV EXPORT] Generated {filename} for patient {patient.name}")
        return filename  # This will be stored in task.result
    except Exception as e:
        print(f"[CSV EXPORT ERROR] {str(e)}")
        return str(e)

# Beat Schedule
celery.conf.beat_schedule = {
    'daily-reminder-every-morning': {
        'task': 'tasks.send_daily_reminders',
        'schedule': crontab(hour=8, minute=0),
    },
    'monthly-report-first-of-month': {
        'task': 'tasks.monthly_report',
        'schedule': crontab(day_of_month=1, hour=9, minute=0),
    },
}