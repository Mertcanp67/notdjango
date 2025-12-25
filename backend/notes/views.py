import uuid
import google.generativeai as genai
from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer, TagSerializer, PublicNoteSerializer
from .permissions import IsOwnerOrReadOnly
from .filters import NoteFilter 
from taggit.models import Tag

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
        base_query = Note.objects.select_related('owner', 'category').prefetch_related('tags').filter(is_deleted=False)
        
        if user.is_staff:
            return base_query.order_by("order", "-created_at")

        return base_query.filter(
            Q(owner=user) | 
            Q(is_public=True)
        ).order_by("order", "-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        print(f"--- SOFT DELETE DEVREDE: Not ID {instance.id} silinmedi, gizlendi. ---")
        instance.is_deleted = True
        instance.save()

    @action(detail=True, methods=['post'], url_path='toggle_pin')
    def toggle_pin(self, request, pk=None):
        note = self.get_object()
        if note.owner != request.user:
            return Response(
                {"error": "You do not have permission to pin this note."},
                status=status.HTTP_403_FORBIDDEN
            )
        note.is_pinned = not note.is_pinned
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        note = self.get_object()
        note.is_public = not note.is_public
        note.save()
        serializer = self.get_serializer(note)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_order(self, request):
        note_ids = request.data.get('note_ids', [])
        if not isinstance(note_ids, list):
            return Response({"error": "note_ids must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        with transaction.atomic():
            for index, note_id in enumerate(note_ids):
                Note.objects.filter(id=note_id, owner=user).update(order=index)
        
        return Response({'status': 'note order updated'}, status=status.HTTP_200_OK)

class PublicNoteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for retrieving publicly shared notes via their UUID.
    """
    queryset = Note.objects.filter(is_public=True, is_deleted=False)
    serializer_class = PublicNoteSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'share_uuid'


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrashedNoteViewSet(viewsets.ModelViewSet):
    """
    Çöp kutusu işlemleri.
    """
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'put', 'head', 'options']
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['updated_at', 'title']
    ordering = ['-updated_at']

    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user, is_deleted=True)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = False
        note.save()
        return Response({'status': 'note restored'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path='empty-all')
    def empty_all(self, request):
        notes = self.get_queryset()
        count = notes.count()
        notes.delete() # Hard delete - Veritabanından siler
        return Response({'status': f'{count} notes deleted permanently'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['put'], url_path='restore-all')
    def restore_all(self, request):
        notes = self.get_queryset()
        count = notes.update(is_deleted=False) 
        return Response({'status': f'{count} notes restored'}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        # Burası Çöp Kutusundan KALICI silme işlemi
        note = self.get_object()
        note.delete() 
        return Response(status=status.HTTP_204_NO_CONTENT)


class TagCloudView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            visible_notes = Note.objects.filter(is_deleted=False)
        else:
            visible_notes = Note.objects.filter(
                Q(owner=user) | Q(is_public=True),
                is_deleted=False 
            ).distinct()

        tags = Tag.objects.filter(
            note__in=visible_notes
        ).annotate(count=Count('note')).order_by('-count', 'name')
        
        top_tags = tags[:50]
        tag_data = [{'name': tag.name, 'count': tag.count} for tag in top_tags if tag.count > 0]
        
        return Response(tag_data)


class TrendingTagsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        thirty_days_ago = timezone.now() - timedelta(days=30)

        visible_notes = Note.objects.filter(
            Q(owner=user) | Q(is_public=True),
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
