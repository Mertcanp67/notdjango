from django.urls import path, include
from rest_framework.routers import DefaultRouter
# View'lerini doğru import ettiğinden emin ol:
from .views import NoteViewSet, CategoryViewSet, TagCloudView, TrendingTagsView, TrashedNoteViewSet

# 1. Router Tanımlamaları
router = DefaultRouter()
router.register("notes", NoteViewSet, basename="note")
router.register("categories", CategoryViewSet, basename="category")
router.register("trashed-notes", TrashedNoteViewSet, basename="trashed-note")

# 2. URL Patterns
urlpatterns = [
    # Özel View'ler (Router ile yapılamayanlar)
    path('tag-cloud/', TagCloudView.as_view(), name='tag-cloud'),
    path('trending-tags/', TrendingTagsView.as_view(), name='trending-tags'),

    # Router'dan gelen tüm URL'leri (notes, categories, trashed-notes) buraya dahil ediyoruz
    path('', include(router.urls)),
]