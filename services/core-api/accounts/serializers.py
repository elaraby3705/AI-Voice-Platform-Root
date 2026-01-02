from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# 1. User Serializer (Fixed: Removed 'username')
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email")  # Only email and ID are available now


# 2. Registration Serializer
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "password")

    def create(self, validated_data):
        # Best practice: Use create_user to handle hashing automatically
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )


# 3. Custom Login Serializer (The JWT Connector)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    This replaces your old LoginSerializer.
    It tells the JWT library to include user details in the response.
    """

    def validate(self, attrs):
        # Generate the standard Access/Refresh tokens
        data = super().validate(attrs)

        # Add custom user data (so the Frontend knows who logged in)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
        }

        return data