from rest_framework import serializers
from dj_rest_auth.serializers import TokenSerializer as RestAuthTokenSerializer
from taggit.serializers import TagListSerializerField, TaggitSerializer
from .models import Note
from django.contrib.auth import get_user_model

# Django'nun kullandığı aktif kullanıcı modelini alıyoruz
User = get_user_model() 

# =========================================================================
# 1. CustomTokenSerializer (Admin Bilgilerini API Token'ına Ekler)
# =========================================================================

class CustomTokenSerializer(RestAuthTokenSerializer):
    """
    Kullanıcı giriş yaptığında, dönen token'a is_staff ve username alanlarını ekler.
    """
    is_staff = serializers.BooleanField(source="user.is_staff", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta(RestAuthTokenSerializer.Meta):
        fields = RestAuthTokenSerializer.Meta.fields + ('is_staff', 'username',)


# =========================================================================
# 2. NoteSerializer (Taggit ve API için Güncellenmiş)
# =========================================================================

class NoteSerializer(TaggitSerializer, serializers.ModelSerializer):
    """
    Note modelini serileştirir. TaggitSerializer'ı miras alarak etiketleri (tags)
    doğru formatta (liste olarak) alır ve gönderir.
    """
    # owner alanını ID yerine username olarak gösterir
    owner = serializers.CharField(source="owner.username", read_only=True)
    
    # tags alanını TagListSerializerField ile etiket listesi olarak serileştirir
    tags = TagListSerializerField()

    class Meta:
        model = Note
        # 'tags' alanını ekledik
        fields = ["id", "title", "content", "created_at", "updated_at", "owner", "is_private", "category", "tags"]
        
        # Sadece bu alanlar kullanıcı tarafından güncellenemez
        read_only_fields = ["id", "created_at", "updated_at", "owner"]