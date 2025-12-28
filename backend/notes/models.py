from django.db import models
from django.contrib.auth.models import User
from taggit.managers import TaggableManager

class Category(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    color = models.CharField(max_length=7, default="#0d6efd") # Örn: #ffffff

    def __str__(self):
        return self.name

class Note(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False) # Çöp kutusu için
    is_shared = models.BooleanField(default=False) # Paylaşım için
    share_uuid = models.UUIDField(null=True, blank=True) # Paylaşım linki için
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes')
    order = models.PositiveIntegerField(default=0) # Sürükle bırak için sıralama
    
    tags = TaggableManager(blank=True) # Etiketler

    def __str__(self):
        return self.title