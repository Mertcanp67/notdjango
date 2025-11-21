
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
        return Category.objects.filter(owner=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)