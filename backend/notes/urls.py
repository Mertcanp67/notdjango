from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, CategoryViewSet, TagViewSet

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = router.urls