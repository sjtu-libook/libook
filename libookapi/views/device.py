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


class DeviceView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("id", OpenApiTypes.INT)
        ],
        responses=UserSerializer(),
    )
    def get(self, request, format=None):
        """
        获取某个设备绑定的位置信息
        1. 验证 API Key
        2. 返回所有需要的信息
        """
        pass

    @extend_schema(
        responses=ErrorSerializer(),
    )
    def post(self, request, format=None):
        """
        用户入座后确认用户的预约
        """
