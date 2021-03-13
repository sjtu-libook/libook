from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F

from ..serializers import *
from ..models import *


class RegionGroupView(viewsets.ReadOnlyModelViewSet):
    """
    获取区域组的信息。
    """
    queryset = RegionGroup.objects.all()
    serializer_class = RegionGroupSerializer
    filter_backends = [DjangoFilterBackend]


class RegionView(viewsets.ReadOnlyModelViewSet):
    """
    获取区域的信息。
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    filter_backends = [DjangoFilterBackend]


class ReservationView(viewsets.ReadOnlyModelViewSet):
    """
    获取预约信息。
    """
    queryset = Reservation.objects.all()
    serializer_class = ReservationDetailSerializer
    filter_backends = [DjangoFilterBackend]


class UserView(views.APIView):
    def get(self, request, format=None):
        """
        获取当前用户信息
        """
        pass
