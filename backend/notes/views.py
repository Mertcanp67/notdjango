from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer
from .permissions import IsOwnerOrReadOnly
from taggit.models import Tag # Tag modelini import ettiğinden emin ol

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "content", "owner__username", "tags__name"]

    def get_permissions(self):
        if self.request.user and self.request.user.is_staff:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Note.objects.all().order_by("-id")

        return Note.objects.filter(
            Q(owner=user) | 
            Q(is_private=False)
        ).distinct().order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Kullanıcının kendi kategorilerini yönetmesi için API endpoint'i.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # DÜZELTME: Sadece kullanıcıya ait kategorileri getir
        return Category.objects.filter(owner=self.request.user).order_by("-id")

    # DÜZELTME: Bu fonksiyon get_queryset'in dışına çıkarıldı (girinti düzeltildi)
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TagCloudView(APIView):
    """
    Kullanıcının notlarına göre etiket bulutu verisi döndürür.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            queryset = Tag.objects.all()
        else:
            note_ids = Note.objects.filter(Q(owner=user) | Q(is_private=False)).values_list('id', flat=True)
            if not note_ids:
                queryset = Tag.objects.none()
            else:
                queryset = Tag.objects.filter(note__id__in=note_ids)

        tags = queryset.annotate(
            num_times=Count('taggit_taggeditem_items')
        ).order_by('-num_times', 'name')

        tags = tags[:50]
        tag_data = [{'name': tag.name, 'count': tag.num_times} for tag in tags]
        
        return Response(tag_data)