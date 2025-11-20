
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.generic import TemplateView
from notes.views import NoteViewSet, CategoryListView

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),

    path("api/auth/", include("dj_rest_auth.urls")),

    path("api/", include(router.urls)),

    path("api/categories/", CategoryListView.as_view(), name="category-list"),
    
    path("", TemplateView.as_view(template_name="index.html"))

]
