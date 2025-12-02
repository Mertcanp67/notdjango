from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer, TagSerializer
from .permissions import IsOwnerOrReadOnly
from .filters import NoteFilter 
from taggit.models import Tag, TaggedItem 


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = NoteFilter 
    filter_backends = [filters.SearchFilter] 
    search_fields = ["title", "content", "owner__username", "tags__name"]

    def get_permissions(self):
        if self.request.user and self.request.user.is_staff:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        # Admin ise hepsini görsün (isteğe bağlı) veya sadece silinmemişleri görsün
        # Normal listede is_deleted=False olanları getirmeliyiz ki çöptekiler ana sayfada çıkmasın.
        base_query = Note.objects.filter(is_deleted=False) 
        
        if user.is_staff:
            return base_query.order_by("-id")

        return base_query.filter(
            Q(owner=user) | 
            Q(is_private=False)
        ).distinct().order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], url_path='related')
    def related_notes(self, request, pk=None):
        note = self.get_object()
        tag_ids = note.tags.values_list('id', flat=True)

        if not tag_ids:
            return Response([])

        user = request.user
        related_notes = Note.objects.filter(
            tags__in=tag_ids,
            is_deleted=False  # Çöptekiler ilişkili notlarda çıkmasın
        ).exclude(
            pk=note.pk
        ).filter(
            Q(owner=user) | Q(is_private=False)
        ).distinct().order_by("-id")[:10]

        serializer = self.get_serializer(related_notes, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Kullanıcının kendi kategorilerini yönetmesi için API endpoint'i.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Sadece kullanıcıya ait kategorileri getir
        return Category.objects.filter(owner=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrashedNoteViewSet(viewsets.ModelViewSet):
    """
    Çöp kutusundaki (silinmiş işaretlenen) notları yönetir.
    """
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Çöp kutusunda genelde sadece listeleme ve kalıcı silme olur, ama şimdilik standart bırakalım.
    
    def get_queryset(self):
        # Sadece giriş yapan kullanıcının, is_deleted=True olan notlarını getir
        return Note.objects.filter(owner=self.request.user, is_deleted=True).order_by("-id")


class TagCloudView(APIView):
    """
    Kullanıcının notlarına göre etiket bulutu verisi döndürür.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            visible_notes = Note.objects.filter(is_deleted=False)
        else:
            # Silinmemiş notlardaki etiketleri gösterelim
            visible_notes = Note.objects.filter(
                Q(owner=user) | Q(is_private=False),
                is_deleted=False 
            ).distinct()

        tags = Tag.objects.filter(
            note__in=visible_notes
        ).annotate(count=Count('note')).order_by('-count', 'name')
        
        top_tags = tags[:50]
        tag_data = [{'name': tag.name, 'count': tag.count} for tag in top_tags if tag.count > 0]
        
        return Response(tag_data)


class TrendingTagsView(APIView):
    """
    Son 30 gün içinde en çok kullanılan etiketleri döndürür.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)

        visible_notes = Note.objects.filter(
            Q(owner=user) | Q(is_private=False),
            created_at__gte=thirty_days_ago,
            is_deleted=False
        ).distinct()

        trending_tags = Tag.objects.filter(
            note__in=visible_notes
        ).annotate(
            count=Count('note')
        ).order_by('-count', 'name')[:10]

        serializer = TagSerializer(trending_tags, many=True, context={'request': request})
        return Response(serializer.data) 