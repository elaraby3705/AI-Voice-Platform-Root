from rest_framework import generics , permissions
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsOwner

# Create your views here.

# Post + get List 
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class= ProjectSerializer
    permissions_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return  Project.objects.filter(owner= self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        
        
        
# get details + update + delete 
class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class= ProjectSerializer
    permissions_classes = [permissions.IsAuthenticated, IsOwner]
    queryset = Project.objects.all()
    