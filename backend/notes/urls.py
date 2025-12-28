from django.urls import path, include
from rest_framework.routers import DefaultRouter
# View'leri import ediyoruz
from .views import (
    NoteViewSet,
    TagCloudView,
    # TrendingTagsView, # Bu view henüz implemente edilmedi.
    TrashedNoteViewSet,
    PublicNoteViewSet,
    CategoryViewSet
)

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("trashed-notes", TrashedNoteViewSet, basename="trashed-note")
router.register("public-notes", PublicNoteViewSet, basename="public-note")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("tags/", TagCloudView.as_view(), name="tag-cloud"),
    # path("trending-tags/", TrendingTagsView.as_view(), name="trending-tags"),
    path("", include(router.urls)),
]