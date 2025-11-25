from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer
from .permissions import IsOwnerOrReadOnly
from .filters import NoteFilter # Oluşturduğumuz filtreyi import ediyoruz
from taggit.models import Tag # Tag modelini import ettiğinden emin ol

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = NoteFilter # Filtre setimizi burada tanımlıyoruz
    filter_backends = [filters.SearchFilter] # Arama özelliğini koruyoruz
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

    @action(detail=True, methods=['get'], url_path='related')
    def related_notes(self, request, pk=None):
        """
        Belirli bir nota ait etiketlerle ilişkili diğer notları döndürür.
        """
        note = self.get_object()
        
        # Notun etiketlerini al
        tag_ids = note.tags.values_list('id', flat=True)

        if not tag_ids:
            # Eğer notun hiç etiketi yoksa, boş liste döndür
            return Response([])

        # Bu etiketlerden herhangi birine sahip olan, ancak mevcut notun kendisi olmayan notları bul
        # Ayrıca kullanıcının görme yetkisi olan notları (kendisininkiler veya public olanlar) filtrele
        user = request.user
        related_notes = Note.objects.filter(
            tags__in=tag_ids
        ).exclude(
            pk=note.pk
        ).filter(
            Q(owner=user) | Q(is_private=False)
        ).distinct().order_by("-id")[:10] # Sonuçları 10 ile sınırla

        # İlişkili notları serialize et
        serializer = self.get_serializer(related_notes, many=True)
        return Response(serializer.data)

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

        # Kullanıcının görebileceği notları (kendisininkiler ve herkese açık olanlar) filtrele
        visible_notes = Note.objects.filter(Q(owner=user) | Q(is_private=False)).distinct()

        # Admin ise tüm notları dikkate al
        if user.is_staff:
            visible_notes = Note.objects.all()
        
        # Taggit'in `tag_counts()` metodunu kullanarak etiketleri ve sayılarını al
        # DÜZELTME: `tag_counts` metodu bulunmuyor. Doğru yöntem, Tag modelini
        # `visible_notes` ile ilişkilendirerek filtrelemek ve saymaktır.
        tags = Tag.objects.filter(
            note__in=visible_notes
        ).annotate(count=Count('note')).order_by('-count', 'name')
        
        # En popüler 50 etiketi al
        top_tags = tags[:50]
        tag_data = [{'name': tag.name, 'count': tag.count} for tag in top_tags if tag.count > 0]
        
        return Response(tag_data)