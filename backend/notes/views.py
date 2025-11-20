
from rest_framework import viewsets, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q 
from .models import Note, CATEGORY_CHOICES
from .serializers import NoteSerializer
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

class CategoryListView(APIView):
    """
    Note modelindeki sabit kategori seçeneklerini listeler.
    Frontend'in beklediği {id, name} formatında bir liste döndürür.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        categories = [{"id": code, "name": name} for code, name in CATEGORY_CHOICES]
        return Response(categories)