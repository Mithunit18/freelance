import smtplib
from email.message import EmailMessage
from config.email import email_settings

def send_contact_email(name: str, email: str, message: str):
    msg = EmailMessage()
    msg["Subject"] = f"New Contact Form Message from {name}"
    msg["From"] = email_settings.SMTP_USER
    msg["To"] = email_settings.SMTP_USER

    msg.set_content(
        f"""
        You have received a new message from the contact form.

        Name: {name}
        Email: {email}

        Message:
        {message}
        """
    )

    try:
        with smtplib.SMTP(email_settings.SMTP_HOST, email_settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(email_settings.SMTP_USER, email_settings.SMTP_PASSWORD)
            smtp.send_message(msg)

        return True
    
    except Exception as e:
        print("Email error:", e)
        return False