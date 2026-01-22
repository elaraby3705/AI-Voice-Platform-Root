from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

# Import custom models and utils
from .models import OneTimePassword
from .utils import send_otp_email
from .serializers import (
    RegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer
)

User = get_user_model()

# ---------------------------------------------------------
# 1. Register View (Modified for OTP)
# ---------------------------------------------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # 1. Save user but keep inactive initially
            user = serializer.save()
            user.is_active = False
            user.save()

            # 2. Attempt to send verification code
            email_sent = send_otp_email(user)

            if email_sent:
                return Response({
                    "message": "Account created successfully. Please check your email for the verification code.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)
            else:
                # If email fails, delete user so they can try again
                user.delete()
                return Response({
                    "error": "Failed to send verification email. Please check your email address."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# 2. Verify OTP View (New Logic)
# ---------------------------------------------------------
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        if not email or not otp_code:
            return Response({"error": "Email and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp_record = OneTimePassword.objects.get(user=user)

            # Check validity and expiration
            if otp_record.code == otp_code and otp_record.is_valid():
                # Activate account
                user.is_active = True
                user.save()

                # Delete used code
                otp_record.delete()

                # Generate tokens now (Post-verification)
                refresh = RefreshToken.for_user(user)

                return Response({
                    "message": "Email verified successfully!",
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired verification code."}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except OneTimePassword.DoesNotExist:
            return Response({"error": "No verification code found for this user."}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# 3. Existing Views (Standard Auth)
# ---------------------------------------------------------

class LoginView(TokenObtainPairView):
    # Handles standard JWT login
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Logout by blacklisting the refresh token
            refresh_token = request.data.get("refresh")

            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)