from django.urls import path, include
from rest_framework.routers import DefaultRouter
# View'leri import ediyoruz
from .views import (
    NoteViewSet, 
    CategoryViewSet, 
    TagCloudView, 
    TrendingTagsView, 
    TrashedNoteViewSet, 
    AITagGeneratorView  
)

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")
router.register("trashed-notes", TrashedNoteViewSet, basename="trashed-note")

urlpatterns = [
    path("tags/", TagCloudView.as_view(), name="tag-cloud"),
    path("trending-tags/", TrendingTagsView.as_view(), name="trending-tags"),
    path("generate-tags/", AITagGeneratorView.as_view(), name="generate-tags"),
    
    path("", include(router.urls)),
]