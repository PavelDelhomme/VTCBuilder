"""
Public schema URL Configuration (for main domain)
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        'app': 'HuberaPress',
        'version': '1.0.0',
        'message': 'API HuberaPress — console /admin, Django staff /django-admin',
        'docs': '/api/docs',
    })

def health(_request):
    return JsonResponse({'status': 'ok', 'service': 'hubera-cms'})

urlpatterns = [
    path('', home),
    path('django-admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('health/', health),
    path('health', health),
]

