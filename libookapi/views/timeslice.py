from django.shortcuts import render
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F

from ..serializers import *
from ..models import *


class TimesliceFilter(django_filters.FilterSet):
    from_time = django_filters.DateTimeFilter(field_name='from_time')
    from_time__gte = django_filters.DateTimeFilter(
        field_name='from_time', lookup_expr='gte')
    from_time__lte = django_filters.DateTimeFilter(
        field_name='from_time', lookup_expr='lte')

    class Meta:
        model = Timeslice
        fields = ['id', 'from_time']


class TimesliceView(viewsets.ReadOnlyModelViewSet):
    """
    获取时间片信息。
    """
    queryset = Timeslice.objects.all()
    serializer_class = TimesliceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TimesliceFilter
