import google.generativeai as genai
from django.conf import settings
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from taggit.models import Tag
from .models import Note, Category
from .serializers import NoteSerializer, CategorySerializer, TagSerializer, PublicNoteSerializer
from .filters import NoteFilter

# --- AI ETIKET OLUSTURUCU ---
genai.configure(api_key=settings.GOOGLE_API_KEY)

class AITagGeneratorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get("title", "")
        content = request.data.get("content", "")
        
        if not title and not content:
            return Response({"error": "Başlık veya içerik gerekli."}, status=400)

        prompt = f"""
        Aşağıdaki metni analiz et ve Türkçe olarak en uygun 3 ila 5 etiketi bul.
        Sadece etiketleri virgül ile ayırarak yaz. Başka açıklama yapma.
        
        Başlık: {title}
        İçerik: {content}
        """

        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            tags_list = [tag.strip() for tag in response.text.strip().split(',') if tag.strip()]
            return Response({"tags": tags_list})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# --- TAGS ---
class TagCloudView(APIView):
    """
    Kullanıcıya ait notlardaki tüm etiketleri listeler.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Sadece mevcut kullanıcıya ait notların etiketlerini al
        tags = Tag.objects.filter(note__owner=request.user).distinct()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data)


# --- NORMAL NOTLAR (Not Listesi) ---
class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = NoteFilter

    def get_queryset(self):
        # Arama parametresi var mı?
        queryset = Note.objects.filter(owner=self.request.user, is_deleted=False)
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query) |
                Q(tags__name__icontains=search_query)
            ).distinct()
            
        return queryset.order_by('-is_pinned', 'order', '-updated_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    # 1. NOTU ÇÖPE ATMA (Soft Delete)
    @action(detail=True, methods=['post'])
    def trash(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = True
        note.save()
        return Response({'status': 'not çöp kutusuna taşındı'})

    # 2. PINLEME (Sabitleme)
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        note = self.get_object()
        note.is_pinned = not note.is_pinned
        note.save()
        return Response({'status': 'pin durumu değişti', 'is_pinned': note.is_pinned})

    # 3. PAYLAŞMA
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        note = self.get_object()
        import uuid
        if not note.share_uuid:
            note.share_uuid = uuid.uuid4()
        
        note.is_shared = not note.is_shared
        note.save()
        return Response(NoteSerializer(note).data)

    # 4. SIRALAMA GÜNCELLEME (Sürükle Bırak)
    @action(detail=False, methods=['put'])
    def update_order(self, request):
        ordered_ids = request.data.get('ordered_ids', [])
        for index, note_id in enumerate(ordered_ids):
            try:
                note = Note.objects.get(id=note_id, owner=request.user)
                note.order = index
                note.save()
            except Note.DoesNotExist:
                continue
        return Response({'status': 'sıralama güncellendi'})


# --- PUBLIC NOTES (Paylaşılan Notlar) ---
class PublicNoteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Paylaşım linki (UUID) ile bir notu halka açık olarak görüntüler.
    """
    queryset = Note.objects.filter(is_shared=True, share_uuid__isnull=False)
    serializer_class = PublicNoteSerializer
    permission_classes = [permissions.AllowAny] # Herkes erişebilir
    lookup_field = 'share_uuid'


# --- ÇÖP KUTUSU (Silinmiş Notlar) ---
class TrashedNoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Sadece silinmişleri getir
        return Note.objects.filter(owner=self.request.user, is_deleted=True).order_by('-updated_at')

    # 1. GERİ YÜKLEME
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        note = self.get_object()
        note.is_deleted = False
        note.save()
        return Response({'status': 'not geri yüklendi'})

    # 2. ÇÖPÜ BOŞALT (Hepsini Kalıcı Sil)
    @action(detail=False, methods=['delete'], url_path='empty-all')
    def empty_all(self, request):
        Note.objects.filter(owner=request.user, is_deleted=True).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- KATEGORİLER ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)