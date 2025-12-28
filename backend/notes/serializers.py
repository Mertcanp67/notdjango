from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from taggit.models import Tag
from .models import Note
from .models import Category
class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")

class NoteSerializer(TaggitSerializer, serializers.ModelSerializer):
    author_username = serializers.CharField(source="owner.username", read_only=True)
    tags = TagListSerializerField()
    
    ALLOWED_TAGS = [
        "p", "strong", "em", "ul", "ol", "li", "br", "h1", "h2",
        "a", "img",
    ]
    ALLOWED_ATTRIBUTES = {
        "*": ["class"], 
        "a": ["href", "title"],
        "img": ["src", "alt", "style"],
    }

    class Meta:
        model = Note
        fields = [
            "id",
            "title",
            "content",
            "created_at",
            "updated_at",
            "author_username",
            "is_shared",
            "is_private",
            "share_uuid",
            "tags",
            "is_pinned",
            "order"
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
            'share_uuid': {'read_only': True}
        }

    def validate_tags(self, value):
        """
        Etiketlerdeki olası '##' gibi istenmeyen karakterleri temizler.
        """
        # Gelen her etiketi temizleyip, sadece harf ve rakamlardan oluşanları alalım.
        # Bu, '##' gibi sorunları ve boş etiketleri engeller.
        clean_tags = [tag.strip().lstrip('#') for tag in value if tag.strip()]
        return clean_tags

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color']
        extra_kwargs = {
            'id': {'read_only': True},
        }


class PublicNoteSerializer(serializers.ModelSerializer):
    tags = TagListSerializerField(read_only=True)
    owner = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Note
        fields = [
            "title",
            "content",
            "created_at",
            "updated_at",
            "tags",
            "owner",
        ]
        read_only_fields = fields