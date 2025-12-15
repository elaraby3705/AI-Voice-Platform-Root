# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegistrationSerializer ,LoginSerializer , UserSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            # Generate token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                },
                "token": token.key
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# create LoginView class
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
            },
            "token": token.key
        }, status=status.HTTP_200_OK)


class MeView(APIView):
    authentication_class = [TokenAuthentication]
    permission_classes  = [IsAuthenticated]

    def get(self, request ):
        serializer  = UserSerializer(request.user)
        return  Response(serializer.data, status= 200 )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
            return Response(
                {"detail":"Logged out successfully. "},
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {"detail": "Token not found. "}, 
                status=status.HTTP_400_BAD_REQUEST
            )