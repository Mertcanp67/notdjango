# backend/notes/models.py - (Düzeltilmiş ve is_private eklendi)

from django.db import models
from django.contrib.auth.models import User
from taggit.managers import TaggableManager

CATEGORY_CHOICES = [
    ('GEN', 'General'),
    ('IMP', 'Important'),
    ('TODO', 'To Do'),
    ('IDE', 'Idea'),
]

class Note(models.Model):
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notes"
    )
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    tags = TaggableManager(blank=True)
    is_private = models.BooleanField(default=False) 

    category = models.CharField(
        max_length=4, 
        choices=CATEGORY_CHOICES, 
        default='GEN'
    )

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        status = "Private" if self.is_private else "Public"
        return f"{self.title} ({self.owner.username}) [{status}]"