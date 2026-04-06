from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timedelta
import csv, os, smtplib, requests
from io import StringIO
from models import Appointment

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_google_chat_message(message_text):
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

        if response.status_code in [200, 204]:
            print("[CHAT WEBHOOK SUCCESS] Message sent")
            return True

        print(f"[CHAT WEBHOOK FAILED] {response.status_code} - {response.text}")
        return False

    except Exception as e:
        print(f"[CHAT WEBHOOK ERROR] {str(e)}")
        return False

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

        if not appointments:
            print("[DAILY REMINDER] No appointments for today")
            return

        # Build a single consolidated message
        lines = [f"📋 *Daily Appointment Reminders — {today.strftime('%d %b %Y')}*\n"]

        for appt in appointments:
            lines.append(
                f"• *{appt.patient.name}* → Dr. {appt.doctor.user.name} "
                f"({appt.doctor.specialization or 'General'}) at *{appt.slot}*"
            )

        lines.append(f"\n_Total: {len(appointments)} appointment(s)_")

        message = "\n".join(lines)

        # Send via Google Chat webhook
        result = send_google_chat_message(message)

        if result:
            print(f"[DAILY REMINDER] Sent {len(appointments)} reminders via Google Chat")
        else:
            print(f"[DAILY REMINDER] Webhook failed, printing to console:")
            print(message)

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

# ═══════════════════════════════════════════════
#  TASK 2 — MONTHLY REPORT
#  Covers PREVIOUS MONTH (IMPORTANT FIX)
# ═══════════════════════════════════════════════
@celery.task(bind=True, name="tasks.monthly_report", max_retries=3)
def monthly_report(self):

    try:
        from app import app

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
                    "specialization": appt.doctor.specialization or "",
                    "appointments": []
                }

            doctors_data[doc_id]["appointments"].append({
                "patient": appt.patient.name,
                "date": str(appt.date),
                "slot": appt.slot,
                "diagnosis": appt.treatment.diagnosis if appt.treatment else "N/A",
                "prescription": appt.treatment.prescription if appt.treatment else "N/A",
                "medicines": appt.treatment.medicines if appt.treatment else "N/A"
            })

        # Send email to each doctor
        for doc_id, doc in doctors_data.items():
            rows_html = ""
            for i, a in enumerate(doc["appointments"], 1):
                rows_html += f"""
                <tr>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{i}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['patient']}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['date']}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['slot']}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['diagnosis']}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['prescription']}</td>
                    <td style="padding:10px 14px;border-bottom:1px solid #e8f0f7;">{a['medicines']}</td>
                </tr>
                """

            html_report = f"""
            <html>
            <body style="margin:0;padding:0;font-family:'Segoe UI',sans-serif;background:#f0f7fb;">
                <div style="max-width:800px;margin:20px auto;background:#fff;border-radius:16px;
                            box-shadow:0 4px 20px rgba(31,69,110,0.1);overflow:hidden;">

                    <div style="background:linear-gradient(135deg,#1F456E,#0492C2);padding:28px 32px;color:#fff;">
                        <h1 style="margin:0;font-size:22px;">Monthly Activity Report</h1>
                        <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">{month_label} — SehatSaathi HMS</p>
                    </div>

                    <div style="padding:28px 32px;">
                        <p style="color:#1F456E;font-size:15px;">
                            Dear <strong>Dr. {doc['doctor']}</strong>,
                        </p>
                        <p style="color:#555;font-size:14px;line-height:1.6;">
                            Here is your monthly activity summary for <strong>{month_label}</strong>.
                            You completed <strong>{len(doc['appointments'])}</strong> appointment(s).
                        </p>

                        <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:13px;">
                            <thead>
                                <tr style="background:#edf8fd;">
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">#</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Patient</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Date</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Slot</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Diagnosis</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Prescription</th>
                                    <th style="padding:10px 14px;text-align:left;color:#084d74;font-size:12px;
                                              text-transform:uppercase;letter-spacing:0.5px;">Medicines</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows_html}
                            </tbody>
                        </table>

                        <p style="color:#888;font-size:13px;margin-top:24px;">
                            This is an automated report from SehatSaathi Hospital Management System.
                        </p>
                    </div>

                </div>
            </body>
            </html>
            """

            # Send email
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"Monthly Activity Report — {month_label}"
                msg["From"]    = app.config["MAIL_SENDER"]
                msg["To"]      = doc["email"]
                msg.attach(MIMEText(html_report, "html"))

                with smtplib.SMTP(app.config["MAIL_SERVER"], app.config["MAIL_PORT"]) as server:
                    server.starttls()
                    server.login(app.config["MAIL_USERNAME"], app.config["MAIL_PASSWORD"])
                    server.sendmail(app.config["MAIL_SENDER"], doc["email"], msg.as_string())

                print(f"[MONTHLY REPORT SENT] Dr. {doc['doctor']} → {doc['email']}")

            except Exception as mail_err:
                print(f"[MONTHLY REPORT MAIL ERROR] Dr. {doc['doctor']}: {str(mail_err)}")

        print(f"[MONTHLY REPORT COMPLETE] {month_label} — {len(doctors_data)} doctors processed")

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