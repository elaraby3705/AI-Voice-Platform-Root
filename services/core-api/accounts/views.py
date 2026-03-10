from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets , generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .models import OneTimePassword, Profile
from .utils import send_otp_email
from .serializers import (
    RegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    ProfileSerializer
)

User = get_user_model()

# ---------------------------------------------------------
# 1. Registration View
# ---------------------------------------------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # User and Profile (via signal) are created
            user = serializer.save()
            user.is_active = False
            user.save()

            if send_otp_email(user):
                return Response({
                    "message": "Account created successfully. Please verify your email.",
                    "email": user.email
                }, status=status.HTTP_201_CREATED)
            else:
                user.delete() # Clean up if email fails
                return Response({
                    "error": "Failed to send verification email."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# 2. OTP Verification View
# ---------------------------------------------------------
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        if not email or not otp_code:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp_record = OneTimePassword.objects.get(user=user)

            if otp_record.code == otp_code and otp_record.is_valid():
                user.is_active = True
                user.is_verified = True # Ensure this is also set
                user.save()
                otp_record.delete()

                refresh = RefreshToken.for_user(user)

                return Response({
                    "message": "Email verified successfully.",
                    "user": UserSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                }, status=status.HTTP_200_OK)

            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        except OneTimePassword.DoesNotExist:
            return Response({"error": "No OTP found for this user."}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# 3. Standard Auth Views
# ---------------------------------------------------------

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Now returns User + Profile fields defined in UserSerializer
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# 4. Profile ViewSet
# ---------------------------------------------------------
class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile

