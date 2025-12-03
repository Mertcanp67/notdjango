import google.generativeai as genai
from django.conf import settings 
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

    def destroy(self, request, *args, **kwargs):
        """
        Bir notu kalıcı olarak silmek yerine 'is_deleted' olarak işaretler (soft delete).
        """
        note = self.get_object()
        note.is_deleted = True
        note.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

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
    # Sadece listeleme, geri getirme ve kalıcı silme işlemlerine izin verelim.
    # Yeni not oluşturma (create) veya güncelleme (update) gibi işlemlere gerek yok.
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    
    def get_queryset(self):
        # Sadece giriş yapan kullanıcının, is_deleted=True olan notlarını getir
        return Note.objects.filter(owner=self.request.user, is_deleted=True).order_by("-id")

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """
        Çöp kutusundaki bir notu geri yükler.
        """
        note = self.get_object()
        note.is_deleted = False
        note.save()
        # Başarılı olduğunda boş yanıt yerine, geri yüklenen notun
        # güncel verisini veya basit bir başarı mesajı döndür.
        return Response({'status': 'note restored'}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Çöp kutusundaki bir notu kalıcı olarak siler (hard delete).
        """
        note = self.get_object()
        note.delete() # Bu, veritabanından kalıcı olarak siler.
        return Response(status=status.HTTP_204_NO_CONTENT)


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
class AITagGeneratorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get("title", "")
        content = request.data.get("content", "")
        
        # Mantık Düzeltmesi: Başlık VE İçerik ikisi de yoksa hata ver.
        # Biri bile varsa çalışsın.
        if not title and not content:
            return Response({"error": "Başlık veya içerik gerekli"}, status=400)

        # Yazım hataları düzeltildi
        prompt = f"""
        Aşağıdaki metni analiz et ve Türkçe olarak en uygun 3 ila 5 etiketi bul.
        Sadece etiketleri virgül ile ayırarak yaz. Başka hiçbir açıklama yapma.
        
        Başlık: {title}
        İçerik: {content}
        """

        try:
            # DÜZELTME: API çağrısı yapmadan önce Google AI kütüphanesini API anahtarı ile yapılandır.
            genai.configure(api_key=settings.GOOGLE_API_KEY)

            # DÜZELTME: Güvenlik ayarları, boş içerik gönderildiğinde oluşabilecek
            # "prompt should not be empty" hatasını önlemek için yapılandırıldı.
            # Bu, modelin daha esnek çalışmasını sağlar.
            model = genai.GenerativeModel(
                "gemini-pro",
                safety_settings={
                    'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                    'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                    'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                    'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                }
            )
            
            # DÜZELTME: Değişken adı 'response' DRF'in Response sınıfı ile çakıştığı için 'gemini_response' olarak değiştirildi.
            gemini_response = model.generate_content(prompt)
            
            # DÜZELTME: Modelin cevabının engellenip engellenmediğini kontrol et.
            # Eğer .text'e erişmeye çalışırken hata alırsak, bu genellikle cevabın
            # güvenlik nedeniyle engellendiği anlamına gelir.
            try:
                tags_text = gemini_response.text.strip()
            except ValueError:
                # Cevap engellendiğinde veya boş olduğunda bu hata fırlatılır.
                print(f"AI Hatası: Modelden geçerli bir metin yanıtı alınamadı. Yanıt: {gemini_response.prompt_feedback}")
                return Response({"error": "Yapay zeka, sağlanan içerik için etiket üretemedi. Lütfen metni değiştirip tekrar deneyin."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Virgülle ayır ve temizle
            tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]
            
            return Response({"tags": tags}, status=200)
            
        except Exception as e:
            # Hata durumunda konsola daha detaylı yazdıralım.
            error_message = f"Gemini API hatası: {str(e)}"
            print(error_message)
            # Frontend'e de daha açıklayıcı bir hata gönderelim.
            # Bu, API anahtarı veya faturalandırma sorunlarını teşhis etmeye yardımcı olur.
            return Response({"error": "Yapay zeka servisine bağlanırken bir sorun oluştu. Lütfen API anahtarınızı ve ayarlarınızı kontrol edin."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
