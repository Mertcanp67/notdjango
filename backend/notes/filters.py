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

    category = filters.CharFilter(field_name='category__name', lookup_expr='icontains')

    class Meta:
        model = Note
        fields = ['tags', 'category', 'is_private']