"""
Django settings for AI_Voice_Platform project.
Optimized for Kubernetes deployment and Cloud SQL environment variables.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# -----------------------------------------------------------------------------
# 1. ENVIRONMENT CONFIGURATION
# -----------------------------------------------------------------------------
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local .env ONLY if the file exists (Development mode).
# In Kubernetes, environment variables are injected directly via Secret/ConfigMap.
env_file = BASE_DIR / '.env'
if env_file.exists():
    load_dotenv(dotenv_path=env_file)

# Security & Debug Settings
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-fallback-key-change-in-prod')
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')

# Read ALLOWED_HOSTS dynamically from environment variable or default to wildcard
ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '*').split(',') if host.strip()]

# -----------------------------------------------------------------------------
# 2. INSTALLED APPS
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    # Default Django Apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-Party Apps
    'rest_framework',  # The API Framework
    'rest_framework_simplejwt',  # JWT Authentication
    'rest_framework_simplejwt.token_blacklist',  # For Secure Logout

    # Local Project Apps
    'accounts.apps.AccountsConfig',  # Users & Auth
    'core.apps.CoreConfig',  # General Utils
    'projects.apps.ProjectsConfig',  # Project Management
    'voice_sessions.apps.VoiceSessionsConfig',  # AI Voice Logic
]

# Custom User Model
AUTH_USER_MODEL = "accounts.User"

# -----------------------------------------------------------------------------
# 3. MIDDLEWARE
# -----------------------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'AI_Voice_Platform.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'AI_Voice_Platform.wsgi.application'

# -----------------------------------------------------------------------------
# 4. DATABASE CONFIGURATION (PostgreSQL / GCP Cloud SQL)
# -----------------------------------------------------------------------------
# Fallback logic to guarantee non-empty types and prevent NoneType connection errors
DB_NAME = os.getenv('DB_NAME')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')

if not all([DB_NAME, DB_USER, DB_PASSWORD, DB_HOST]):
    print("⚠️ WARNING: Database credentials missing in environment variables!")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}

# -----------------------------------------------------------------------------
# 5. PASSWORD VALIDATION
# -----------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -----------------------------------------------------------------------------
# 6. INTERNATIONALIZATION & STATIC FILES
# -----------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------------------------
# 7. DRF & JWT CONFIGURATION (Enterprise Grade)
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    # Authentication
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    # Permissions
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],

    # Global Pagination
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,

    # Global Throttling (Defense in Depth against API spam)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',  # Limit for unauthenticated users
        'user': '1000/day',  # Limit for authenticated users
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# -----------------------------------------------------------------------------
# 8. SMTP EMAIL CONFIGURATION (Secure)
# -----------------------------------------------------------------------------
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = f"AI Voice System <{EMAIL_HOST_USER}>" if EMAIL_HOST_USER else "AI Voice System <noreply@example.com>"

if not EMAIL_HOST or not EMAIL_HOST_PASSWORD:
    print("⚠️ WARNING: Email configuration is missing in environment variables.")

# -----------------------------------------------------------------------------
# 9. LIVEKIT API (AI Voice Service)
# -----------------------------------------------------------------------------
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
