from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics
from rest_framework.decorators import api_view

from .serializers import *
from .models import *


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


class QueryRegionReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time", TimesliceSerializer),
            OpenApiParameter("max_time", TimesliceSerializer),
            OpenApiParameter("region_id", OpenApiTypes.INT,
                             OpenApiParameter.PATH),
        ],
        responses=RegionReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询区域的预约情况
        """
        pass


class QueryRegionGroupReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time", TimesliceSerializer),
            OpenApiParameter("max_time", TimesliceSerializer),
            OpenApiParameter("region_group_id",
                             OpenApiTypes.INT, OpenApiParameter.PATH),
        ],
        responses=RegionGroupReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询区域组的预约情况
        """
        pass


class BatchReservationView(views.APIView):
    queryset = Reservation.objects.all()

    @extend_schema(
        parameters=[
            OpenApiParameter("min_time", TimesliceSerializer),
            OpenApiParameter("max_time", TimesliceSerializer)
        ],
        responses=ReservationDetailSerializer(many=True),
    )
    def get(self, request, format=None):
        """
        获取当前用户的所有预定信息。
        """
        user = self.request.user
        return Reservation.objects.filter(user=user)

    @extend_schema(
        parameters=[
            OpenApiParameter("delete", OpenApiTypes.BOOL)
        ],
        request=ReservationSerializer(many=True),
        responses=ResultSerializer,
    )
    def post(self, request, format=None):
        """
        批量订位/取消订位
        1. 用户只能在预约时间之前更改预约信息
        2. 一个场地的预约数不能超过场地限制
        3. 用户在同一个时间段只能预约一个场地
        4. ...
        """
        pass


class UserView(views.APIView):
    def get(self, request, format=None):
        """
        获取当前用户信息
        """
        pass
