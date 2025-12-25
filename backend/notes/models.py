# backend/notes/models.py
import uuid
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
    updated_at = models.DateTimeField(auto_now=True)
    tags = TaggableManager(blank=True)
    is_public = models.BooleanField(default=False)
    share_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_deleted = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_pinned = models.BooleanField(default=False)

    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="notes"
    )

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        privacy = "Public" if self.is_public else "Private"
        return f"{self.title} ({self.owner.username}) [{privacy}]"

class Category(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, default="#808080") 
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="categories")

    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('owner', 'name') ,
    def __str__(self):
        return f"{self.name} ({self.owner.username})"