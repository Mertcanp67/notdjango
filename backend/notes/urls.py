from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, CategoryViewSet

router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = router.urls