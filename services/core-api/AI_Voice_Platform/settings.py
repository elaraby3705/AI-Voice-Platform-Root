"""
Django settings for AI_Voice_Platform project.
"""

from pathlib import Path
from datetime import timedelta # Required for JWT time settings
import os
from dotenv import load_dotenv # Required to read .env file

# -----------------------------------------------------------------------------
# 1. ENVIRONMENT CONFIGURATION
# -----------------------------------------------------------------------------
# CRITICAL: Load environment variables BEFORE accessing them.
# This fixes the issue where variables were returning None.
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# Get SECRET_KEY from .env, fallback to insecure key only for dev
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-fallback-key-change-in-prod')

# Get DEBUG from .env (default to True for dev)
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Allow all hosts for Docker/Dev environment
ALLOWED_HOSTS = ["*"]


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
    'rest_framework',                   # The API Framework
    'rest_framework_simplejwt',         # JWT Authentication
    'rest_framework_simplejwt.token_blacklist', # For Secure Logout (Blacklisting tokens)
    'corsheaders',                      # Allows Frontend (React) to talk to Backend

    # Local Project Apps
    'accounts.apps.AccountsConfig',      # Users & Auth
    'core.apps.CoreConfig',              # General Utils
    'projects.apps.ProjectsConfig',      # Project Management
    'voice_sessions.apps.VoiceSessionsConfig', # AI Voice Logic
]

# Point to your custom User model in accounts app
AUTH_USER_MODEL = "accounts.User"


# -----------------------------------------------------------------------------
# 3. MIDDLEWARE
# -----------------------------------------------------------------------------
MIDDLEWARE = [
    # CRITICAL: CorsMiddleware must be at the very top to handle headers first
    "corsheaders.middleware.CorsMiddleware",

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
# 4. DATABASE
# -----------------------------------------------------------------------------
# Using PostgreSQL configuration from .env
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}


# -----------------------------------------------------------------------------
# 5. PASSWORD VALIDATION
# -----------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# -----------------------------------------------------------------------------
# 6. INTERNATIONALIZATION & STATIC FILES
# -----------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
# Location where static files are collected for production
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# -----------------------------------------------------------------------------
# 7. DRF & JWT CONFIGURATION (The Professional Setup)
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    # Use JWT Authentication as the default mechanism
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # By default, all endpoints require Login (IsAuthenticated)
    # We use @permission_classes([AllowAny]) in views to override this for Register/Login
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Session lasts 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),     # Refresh available for 24 hours
    'ROTATE_REFRESH_TOKENS': True,                   # Issue new refresh token on use
    'BLACKLIST_AFTER_ROTATION': True,                # Security: Old tokens cannot be reused
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),                # Format: "Authorization: Bearer <token>"
}


# -----------------------------------------------------------------------------
# 8. CORS CONFIGURATION (Frontend Connection)
# -----------------------------------------------------------------------------
# List of trusted origins (React Frontend IPs)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.100.30:5173", # Your VBox VM IP
]
# If you run into issues, you can uncomment this for dev, but it's less secure:
# CORS_ALLOW_ALL_ORIGINS = True


# -----------------------------------------------------------------------------
# 9. LIVEKIT API (AI Voice Service)
# -----------------------------------------------------------------------------
LIVEKIT_API_URL = os.environ.get("LIVEKIT_API_URL")
LIVEKIT_API_KEY = os.environ.get("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET")