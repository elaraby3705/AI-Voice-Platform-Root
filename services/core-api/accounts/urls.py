from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    LoginView,
    MeView,
    LogoutView,
    VerifyOTPView,
    ProfileView
)

urlpatterns = [
    # -----------------------------------------------------
    # 1. Standard Auth Endpoints
    # -----------------------------------------------------
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("verify-email/", VerifyOTPView.as_view(), name="auth-verify-email"),
    path("profile/", ProfileView.as_view(), name="profile"),
]