import logging
import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OneTimePassword

logger = logging.getLogger(__name__)

def send_otp_email(user):
    """
    Generates a verification code and sends it to the user's email.
    """
    try:
        # 1. Generate code using the model's class method
        otp_instance = OneTimePassword.generate_code(user)

        # 2. Prepare email content
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

        # 3. Send the email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True

    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False
