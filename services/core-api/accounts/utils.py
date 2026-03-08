import logging
from django.core.mail import send_mail
from django.conf import settings
from .models import OneTimePassword

# Initialize logger for production error tracking
logger = logging.getLogger(__name__)

def send_otp_email(user):
    """
    Generates a verification code and sends it to the user's email.
    Returns True if the email was sent successfully, False otherwise.
    """
    try:
        # 1. Generate the OTP code using the model's class method
        otp_instance = OneTimePassword.generate_code(user)

        # 2. Construct the email content
        subject = 'Nexus AI - Verification Code'
        message = (
            f"Hi there,\n\n"
            f"Welcome to Nexus AI!\n"
            f"Your verification code is: {otp_instance.code}\n\n"
            f"This code expires in 5 minutes.\n"
            f"Do not share this code with anyone.\n\n"
            f"Best regards,\n"
            f"Nexus AI Team"
        )

        # 3. Dispatch the email using Django's standard mail service
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True

    except Exception as e:
        # Log the error with full stack trace info if possible
        logger.error(f"Error sending email to {user.email}: {str(e)}")
        return False
