from django.shortcuts import render
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F
from django.utils.timezone import now

from ..serializers import *
from ..models import *


class DeviceView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter('id', OpenApiTypes.INT, OpenApiParameter.PATH),
            OpenApiParameter('api_key', OpenApiTypes.INT)
        ],
        responses=DeviceReservationSerializer(many=True),
    )
    def get(self, request, id, format=None):
        """获取当前位置上的用户信息"""
        device_id = id
        api_key = request.GET.get('api_key')
        device = Device.objects.get(id=device_id)
        if device.api_key == api_key:
            reservations = Reservation.objects.filter(
                region=device.region,
                time__from_time__lte=now(),
                time__to_time__gte=now()).select_related()
            return Response(DeviceReservationSerializer(reservations, many=True).data, status.HTTP_200_OK)
        else:
            return Response('invalid credentials', status.HTTP_401_UNAUTHORIZED)

    @extend_schema(
        responses=ErrorSerializer(),
    )
    def post(self, request, format=None):
        """
        TODO: 嵌入式设备提交的，创建新的 Serializer，并实现该接口
        用户入座后确认用户的预约
        """
