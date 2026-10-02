from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "database": "connected"}, status=200)
    except Exception as e:
        return JsonResponse({"status": "error", "database": str(e)}, status=503)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check),
    path('api/v1/auth/', include('accounts.urls')),
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/sessions/", include("voice_sessions.urls")),
]
