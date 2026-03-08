from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# 1. User Serializer
class UserSerializer(serializers.ModelSerializer):
    """
    Shows basic user info. Added support for profile fields if needed.
    """
    first_name = serializers.CharField(source='profile.first_name', read_only=True)
    last_name = serializers.CharField(source='profile.last_name', read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name")


# 2. Registration Serializer
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )


# 3. Custom Login Serializer (Robust & Safe)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT Serializer with safety checks to prevent 500 errors 
    if a user lacks a profile.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Safely access profile data using getattr
        profile = getattr(self.user, 'profile', None)
        
        data['user'] = {
            'id': str(self.user.id),  # Ensure UUID is string for JSON
            'email': self.user.email,
            'first_name': profile.first_name if profile else "",
            'last_name': profile.last_name if profile else "",
        }

        return data
