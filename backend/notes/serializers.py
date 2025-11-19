
from django.contrib.auth.models import User
from rest_framework import serializers
from dj_rest_auth.serializers import TokenSerializer as RestAuthTokenSerializer
from .models import Note


class CustomTokenSerializer(RestAuthTokenSerializer):
    is_staff = serializers.BooleanField(source="user.is_staff", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta(RestAuthTokenSerializer.Meta):
        fields = RestAuthTokenSerializer.Meta.fields + ('is_staff', 'username',)

class NoteSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "owner", "is_private", "category"]
        
        read_only_fields = ["id", "created_at", "owner"]
        
