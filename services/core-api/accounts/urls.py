from django.urls import path
from .views import RegisterView, LoginView, MeView, LogoutView, VerifyOTPView

urlpatterns = [
    # -----------------------------------------------------
    # 1. Standard Auth Endpoints
    # -----------------------------------------------------
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="me"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    # -----------------------------------------------------
    # 2. New OTP Verification Endpoint
    # -----------------------------------------------------
    path("verify-email/", VerifyOTPView.as_view(), name="auth-verify-email"),
]