from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics, status
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

class UserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses=UserSerializer(),
    )
    def get(self, request, format=None):
        """
        获取当前用户信息
        """
        serializer = UserSerializer(User.objects.get(username=request.user))
        return Response(serializer.data, status=status.HTTP_200_OK)
