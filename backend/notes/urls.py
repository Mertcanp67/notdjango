from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notes.views import NoteViewSet, CategoryViewSet, TagCloudView

# Router Ayarları
router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")
# NOT: TagCloudView bir ViewSet olmadığı için buraya eklenmez, aşağıda path olarak eklenir.

urlpatterns = [
    path('admin/', admin.site.urls), # Admin paneli yolu eklendi
    path("api/", include(router.urls)),
    path("api/tags/", TagCloudView.as_view(), name='tag-cloud'), # Doğru kullanım
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
]