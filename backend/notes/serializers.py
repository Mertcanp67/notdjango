from rest_framework import serializers
from taggit.serializers import TagListSerializerField, TaggitSerializer
from taggit.models import Tag
from .models import Note, Category

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category    
        fields = ['id', 'name', 'color']
        read_only_fields = ['owner']

class NoteSerializer(TaggitSerializer, serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)
    tags = TagListSerializerField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    
    # İleride HTML temizliği (Sanitization) yapmak istersen bu listeleri kullanabilirsin.
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
            "owner",
            "is_private",
            "category",
            "category_id",
            "tags",
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'created_at': {'read_only': True}
        }

    def validate_category_id(self, value):
        """
        Kullanıcının sadece kendi kategorisini seçebilmesini sağlar.
        """
        if value and value.owner != self.context['request'].user:
            raise serializers.ValidationError("Bu kategoriye not ekleme yetkiniz yok.")
        return value