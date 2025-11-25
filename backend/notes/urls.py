from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import NoteViewSet, CategoryViewSet, TagViewSet, TagAdminViewSet, TagCloudView, TrendingTagsView

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")
router.register("tags", TagViewSet, basename="tag")
router.register("admin/tags", TagAdminViewSet, basename="tag-admin")

urlpatterns = router.urls + [
    path('tag-cloud/', TagCloudView.as_view(), name='tag-cloud'),
    path('trending-tags/', TrendingTagsView.as_view(), name='trending-tags'),
]