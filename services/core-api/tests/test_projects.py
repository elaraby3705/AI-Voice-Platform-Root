# test_projects.py 
import pytest
from django.urls import reverse 
from rest_framework.test import APIClient
from rest_framework import status 
from projects.models import Project

@pytest.mark.django_db
def test_create_project(authenticated_user):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {authenticated_user['token']}")
    
    payload = {
        "name": "AI Voice Project",
        "description": "Testing create project"
    }
    
    response = client.post(reverse("project-list"), payload)
    
    assert response.status_code ==status.HTTP_201_CREATED
    assert project.objects.count()==1
    assert response.data["name"] == "AI Voice Project "
    
@pytest.mark.django_db
def test_list_projects(authenticated_user, create_project):
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {authenticated_user['token']}")
    
    response = client.get(reverse("project-list"))
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1 # only user's project is returned
    