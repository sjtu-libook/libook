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
from datetime import timedelta
from itertools import groupby
from operator import itemgetter

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
            OpenApiParameter('fake', OpenApiTypes.BOOL, description='返回测试数据'),
            OpenApiParameter(
                'from_time', OpenApiTypes.DATETIME, description='起始时间'),
            OpenApiParameter('to_time', OpenApiTypes.DATETIME,
                             description='终止时间'),
        ],
        responses=DeviceReservationSerializer(many=True),
    )
    def get(self, request, id, format=None):
        """获取当前位置上的用户信息"""
        device_id = id
        api_key = request.GET.get('api_key')
        device = Device.objects.get(id=device_id)
        if device.api_key == api_key:
            if request.GET.get('fake') == 'true':
                return Response(FAKE_DATA, status.HTTP_200_OK)
            reservations = Reservation.objects.filter(
                region=device.region,
                time__from_time__gte=request.GET.get('from_time'),
                time__from_time__lte=request.GET.get('to_time')).select_related()
            return Response(DeviceReservationSerializer(reservations, many=True).data, status.HTTP_200_OK)
        else:
            return Response('invalid credentials', status.HTTP_401_UNAUTHORIZED)

    @extend_schema(
        parameters=[
            OpenApiParameter('id', OpenApiTypes.INT,
                             OpenApiParameter.PATH, description='设备 ID')
        ],
        request=DeviceModifySerializer(),
        responses=ErrorSerializer(),
    )
    def post(self, request, id, format=None):
        """
        处理用户入座逻辑。

        如果是用户入座，需要提供预定 ID。

        如果用户首次入座修改指纹等信息，需要提供指纹 ID 和用户的一次性验证 Token。
        """

        device_id = id
        device = Device.objects.get(id=device_id)
        serializer = DeviceModifySerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            if device.api_key == serializer.data['api_key']:
                if 'reservation_id' in serializer.data:
                    # 首先，更新用户的预定情况为“已入座”
                    reservation = Reservation.objects.get(
                        id=serializer.data['reservation_id'])
                    reservation.is_present = True
                    reservation.save()
                if 'fingerprint_id' in serializer.data:
                    # 而后，更新用户的身份信息
                    # TODO: 验证一次性 Token
                    user = User.objects.get(id=serializer.data['user_id'])
                    user_info, created = UserInfo.objects.get_or_create(
                        user=user)
                    user_info.fingerprint_id = serializer.data['fingerprint_id']
                    user_info.save()
                return Response('', status.HTTP_200_OK)
            else:
                return Response('invalid credentials', status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
