from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    MeView,
    LogoutView,
    VerifyOTPView,
    ProfileViewSet  # Importing the new Profile ViewSet
)

# Initialize the router for the Profile ViewSet
router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    # -----------------------------------------------------
    # 1. Standard Auth Endpoints
    # -----------------------------------------------------
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("verify-email/", VerifyOTPView.as_view(), name="auth-verify-email"),
    # 2. Profile Management Endpoints
    path("", include(router.urls)),
]