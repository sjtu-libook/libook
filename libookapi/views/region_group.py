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
