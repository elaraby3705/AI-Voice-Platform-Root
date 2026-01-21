from django.core.mail import send_mail
from django.conf import settings
from .models import OneTimePassword


def send_otp_email(user):
    """
    Generates a verification code and sends it to the user's email.
    Returns True if successful, False otherwise.
    """
    try:
        # 1. Generate code and save to DB
        otp_instance = OneTimePassword.generate_code(user)

        # 2. Prepare email content
        subject = 'Nexus AI - Verification Code'
        message = f"""
        Hi {user.username},

        Welcome to Nexus AI!
        Your verification code is: {otp_instance.code}

        This code expires in 5 minutes.
        Do not share this code with anyone.

        Best regards,
        Nexus AI Team
        """

        # 3. Send the email
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False