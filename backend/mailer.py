"""
G.A.T.E - Email sending utility (Gmail SMTP) for OTP delivery
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")


def send_otp_email(to_email: str, otp_code: str, user_name: str = "") -> bool:
    """Sends a 6-digit password reset code via Gmail SMTP. Returns True on success."""
    if not GMAIL_ADDRESS or not GMAIL_APP_PASSWORD:
        print("WARNING: GMAIL_ADDRESS / GMAIL_APP_PASSWORD not set in .env - cannot send email.")
        return False

    greeting = f"Hi {user_name}," if user_name else "Hi,"
    body = f"""{greeting}

Your G.A.T.E. password reset code is:

    {otp_code}

This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.

- G.A.T.E. (Gesture and Text Engine)
"""

    msg = MIMEMultipart()
    msg["From"] = GMAIL_ADDRESS
    msg["To"] = to_email
    msg["Subject"] = "G.A.T.E. - Password Reset Code"
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"ERROR sending OTP email: {e}")
        return False