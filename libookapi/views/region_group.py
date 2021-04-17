from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F, Sum

from ..serializers import *
from ..models import *


class RegionGroupDetailView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("id", OpenApiTypes.INT, OpenApiParameter.PATH),
        ],
        responses=RegionGroupDetailSerializer(),
    )
    def get(self, request, id):
        """
        查询区域组下面的所有区域
        """
        region_group = RegionGroup.objects.annotate(
            capacity=Sum('regions__capacity')).get(id=id)
        serializer = RegionGroupDetailSerializer(region_group)
        return Response(serializer.data)


class RegionRecommendationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter("id", OpenApiTypes.INT, OpenApiParameter.PATH),
        ],
        responses=RegionGroupSerializer(many=True),
    )
    def get(self, request):
        """
        根据用户的预定历史推荐区域
        """
        region_ids = Reservation.objects \
            .filter(user=request.user) \
            .values_list('region', flat=True) \
            .distinct()
        group_ids = Region.objects \
            .filter(id__in=region_ids) \
            .values_list('group', flat=True) \
            .distinct()
        region_groups = RegionGroup.objects \
            .filter(id__in=group_ids) \
            .annotate(capacity=Sum('regions__capacity'))
        serializer = RegionGroupDetailSerializer(region_groups, many=True)
        return Response(serializer.data)
