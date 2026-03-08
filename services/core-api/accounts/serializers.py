from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for handling profile data separately.
    """

    class Meta:
        model = Profile
        fields = ("first_name", "last_name", "phone_number", "country", "company")


class UserSerializer(serializers.ModelSerializer):
    """
    Main User serializer including nested Profile data.
    """
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "email", "profile")


class RegistrationSerializer(serializers.ModelSerializer):
    """
    Registration serializer that creates both User and Profile instances.
    """
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name")

    def create(self, validated_data):
        # Extract profile data
        profile_data = {
            'first_name': validated_data.pop('first_name', ''),
            'last_name': validated_data.pop('last_name', '')
        }

        # Create User
        user = User.objects.create_user(**validated_data)

        # Create Profile
        Profile.objects.create(user=user, **profile_data)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT Serializer including User ID and Profile details for frontend state.
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': str(self.user.id),  # Ensure UUID is cast to string
            'email': self.user.email,
            'first_name': self.user.profile.first_name,
            'last_name': self.user.profile.last_name
        }
        return data