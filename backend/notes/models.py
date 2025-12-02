# backend/notes/models.py

from django.db import models
from django.contrib.auth.models import User
from taggit.managers import TaggableManager

class Note(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notes"
    )
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    tags = TaggableManager(blank=True)
    is_private = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="notes"
    )

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        privacy = "Private" if self.is_private else "Public"
        return f"{self.title} ({self.owner.username}) [{privacy}]"

class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#808080") # Hex color code
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('owner', 'name') # Bir kullanıcının aynı isimde iki kategorisi olamaz

    def __str__(self):
        return f"{self.name} ({self.owner.username})"