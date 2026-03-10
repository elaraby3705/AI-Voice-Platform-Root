from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

User = get_user_model()


# 1. User & Profile Combined Serializer
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer that combines User and Profile data into a single response.
    """
    first_name = serializers.CharField(source='profile.first_name', read_only=True)
    last_name = serializers.CharField(source='profile.last_name', read_only=True)
    bio = serializers.CharField(source='profile.bio', read_only=True)
    preferred_voice_model = serializers.CharField(source='profile.preferred_voice_model', read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "bio", "preferred_voice_model")


# 2. Registration Serializer
class RegistrationSerializer(serializers.ModelSerializer):
    """
    Handles user registration.
    """
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )


# 3. Custom Login Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT Serializer updated to include profile settings in the login response.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        # Safely access profile data using the related_name 'profile'
        profile = getattr(self.user, 'profile', None)

        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'first_name': profile.first_name if profile else "",
            'last_name': profile.last_name if profile else "",
            'preferred_voice_model': profile.preferred_voice_model if profile else "gpt-4o",
            'notifications_enabled': profile.notifications_enabled if profile else True,
        }
        return data