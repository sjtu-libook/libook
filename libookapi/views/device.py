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

FAKE_DATA = [{
    'id': 1,
    'region': {'id': 1, 'name': '新图 E100', 'group': 1, 'capacity': 100},
    'time': {'id': 1, 'from_time': '2021-03-27T21:14:19.191815+08:00',
             'to_time': '2021-03-27T22:14:19.191821+08:00'},
    'user': {'id': 1, 'username': 'Alex Chi', 'user_info': {'fingerprint_id': 1, 'face_id': None}}}]


class DeviceView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter('id', OpenApiTypes.INT,
                             OpenApiParameter.PATH, description='设备 ID'),
            OpenApiParameter('api_key', OpenApiTypes.STR,
                             description='API Key'),
            OpenApiParameter('fake', OpenApiTypes.BOOL, description='返回测试数据')
        ],
        responses=DeviceReservationSerializer(many=True),
    )
    def get(self, request, id, format=None):
        """获取当前位置上的用户信息"""
        device_id = id
        api_key = request.GET.get('api_key')
        device = Device.objects.get(id=device_id)
        if device.api_key == api_key:
            if request.GET.get('fake'):
                return Response(FAKE_DATA, status.HTTP_200_OK)
            reservations = Reservation.objects.filter(
                region=device.region,
                time__from_time__lte=now(),
                time__to_time__gte=now()).select_related()
            return Response(DeviceReservationSerializer(reservations, many=True).data, status.HTTP_200_OK)
        else:
            return Response('invalid credentials', status.HTTP_401_UNAUTHORIZED)

    @extend_schema(
        parameters=[
            OpenApiParameter('id', OpenApiTypes.INT,
                             OpenApiParameter.PATH, description='设备 ID'),
            OpenApiParameter('api_key', OpenApiTypes.STR,
                             description='API Key')
        ],
        request=DeviceModifySerializer(),
        responses=ErrorSerializer(),
    )
    def post(self, request, format=None):
        """
        处理用户入座逻辑。

        如果用户之前已经成功入座，则仅需要提供用户 ID 即可。

        如果用户第一次入座，需要修改指纹等信息，需要提供指纹 ID 和用户的一次性验证 Token。
        """
        # TODO: 嵌入式设备提交的，创建新的 Serializer，并实现该接口用户入座后确认用户的预约
        pass
