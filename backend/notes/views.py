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
            is_deleted=False  
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
        return Category.objects.filter(owner=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrashedNoteViewSet(viewsets.ModelViewSet):
    """
    Çöp kutusundaki (silinmiş işaretlenen) notları yönetir.
    """
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    
    def get_queryset(self):
        return Note.objects.filter(owner=self.request.user, is_deleted=True).order_by("-id")

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """
        Çöp kutusundaki bir notu geri yükler.
        """
        note = self.get_object()
        note.is_deleted = False
        note.save()
        return Response({'status': 'note restored'}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        Çöp kutusundaki bir notu kalıcı olarak siler (hard delete).
        """
        note = self.get_object()
        note.delete() 
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
        
        if not title and not content:
            return Response({"error": "Başlık veya içerik gerekli"}, status=400)

        prompt = f"""
        Aşağıdaki metni analiz et ve Türkçe olarak en uygun 3 ila 5 etiketi bul.
        Sadece etiketleri virgül ile ayırarak yaz. Başka hiçbir açıklama yapma.
        
        Başlık: {title}
        İçerik: {content}
        """

        try:
            genai.configure(api_key=settings.GOOGLE_API_KEY)

            model = genai.GenerativeModel(
                "gemini-1.5-flash",
                safety_settings={
                    'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                    'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                    'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                    'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                }
            )
            
            gemini_response = model.generate_content(prompt)
            
            try:
                tags_text = gemini_response.text.strip()
            except ValueError:
                print(f"AI Hatası: Modelden geçerli bir metin yanıtı alınamadı. Yanıt: {gemini_response.prompt_feedback}")
                return Response({"error": "Yapay zeka, sağlanan içerik için etiket üretemedi. Lütfen metni değiştirip tekrar deneyin."}, status=status.HTTP_400_BAD_REQUEST)
            
            tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]
            
            return Response({"tags": tags}, status=200)
            
        except Exception as e:
            error_message = f"Gemini API hatası: {str(e)}"
            print(error_message)
            return Response({"error": "Yapay zeka servisine bağlanırken bir sorun oluştu. Lütfen API anahtarınızı ve ayarlarınızı kontrol edin."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
