import pytest
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from projects.models import Project

User = get_user_model()

@pytest.fixture
def authenticated_user():
    user = User.objects.create_user(
        email="test@example.com",
        password="password123"
    )
    refresh = RefreshToken.for_user(user)

    return {
        "user": user,
        "token": str(refresh.access_token)
    }


@pytest.fixture
def other_user():
    user = User.objects.create_user(
        email="other@example.com",
        password="password123"
    )
    refresh = RefreshToken.for_user(user)

    return {
        "user": user,
        "token": str(refresh.access_token)
    }


@pytest.fixture
def create_project(authenticated_user):
    return Project.objects.create(
        owner=authenticated_user["user"],
        name="Test Project"
    )
