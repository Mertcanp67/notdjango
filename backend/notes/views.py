
from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q 
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer
from .permissions import IsOwnerOrReadOnly


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    
    permission_classes = [permissions.IsAuthenticated] 
    
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "content", "owner__username", "tags__name"]

    def get_permissions(self):
        """
        Admin olmayan kullanıcılar için IsOwnerOrReadOnly iznini uygular.
        Adminler için bu izni atlar, böylece her nesneye erişebilirler.
        """
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
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

from taggit.models import Tag
from django.db.models import Count

class TagCloudView(APIView):
    """
    Kullanıcının notlarına göre etiket bulutu verisi döndürür.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            # Admin tüm etiketleri görür
            queryset = Tag.objects.all()
        else:
            # Normal kullanıcılar kendi notlarının veya herkese açık notların etiketlerini görür
            note_ids = Note.objects.filter(Q(owner=user) | Q(is_private=False)).values_list('id', flat=True)
            queryset = Tag.objects.filter(notes__id__in=note_ids)

        # Etiketleri say ve en çok kullanılandan en aza doğru sırala
        tags = queryset.annotate(
            num_times=Count('taggit_taggeditem_items')
        ).order_by('-num_times', 'name')

        # Sadece 50 en popüler etiketi al
        tags = tags[:50]

        # Veriyi JSON formatına uygun hale getir
        tag_data = [{'name': tag.name, 'count': tag.num_times} for tag in tags]
        
        return Response(tag_data)
