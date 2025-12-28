from django_filters import rest_framework as filters
from .models import Note

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    """
    Virgülle ayrılmış değerleri kabul eden bir filtre.
    Örn: ?tags=django,python
    """
    pass

class NoteFilter(filters.FilterSet):
    """
    Note modeli için filtre seti.
    """
    tags = CharInFilter(field_name='tags__name', lookup_expr='in')
    is_public = filters.BooleanFilter(field_name='is_shared') # Modeldeki alan adı is_shared

    class Meta:
        model = Note
        # 'is_public' alanını yukarıda özel olarak tanımladığımız için
        # Meta.fields içinde sadece 'tags' bırakmak yeterlidir.
        fields = ['tags']
