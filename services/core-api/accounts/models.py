import random
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------
# 1. User Manager (Logic for creating users via Email)
# ---------------------------------------------------------

class UserManager(BaseUserManager):
    """Custom user manager that uses email instead of username."""
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


# ---------------------------------------------------------
# 2. Custom User Model
# ---------------------------------------------------------

class User(AbstractUser):
    """Custom user model using email as unique identifier."""
    username = None  # remove username field entirely
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# ---------------------------------------------------------
# 3. OTP Model (Added for Email Verification)
# ---------------------------------------------------------

class OneTimePassword(models.Model):
    # One-to-One relationship with the User model
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.code}"

    @classmethod
    def generate_code(cls, user):
        """
        Creates a new 6-digit code for the user.
        Deletes any existing code first to ensure only one valid code exists.
        """
        cls.objects.filter(user=user).delete()

        # Generate a random 6-digit string
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        return cls.objects.create(user=user, code=code)

    def is_valid(self):
        """
        Checks if the code was created within the last 5 minutes (300 seconds).
        """
        now = timezone.now()
        diff = now - self.created_at
        return diff.total_seconds() < 300