from django.urls import path, include
from rest_framework.routers import DefaultRouter
from notes.views import NoteViewSet, CategoryViewSet, TagCloudView

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/tags/", TagCloudView.as_view(), name='tag-cloud'),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
]
