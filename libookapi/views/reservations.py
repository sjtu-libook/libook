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


class QueryRegionReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time_id", OpenApiTypes.INT),
            OpenApiParameter("max_time_id", OpenApiTypes.INT),
            OpenApiParameter("region_id", OpenApiTypes.INT,
                             OpenApiParameter.PATH),
        ],
        responses=RegionReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询区域的预约情况
        """
        region = request.GET.get('region_id')
        min_time_id = request.GET.get('min_time_id')
        max_time_id = request.GET.get('max_time_id')
        reserved_time = Reservation.objects \
            .filter(time__gte=min_time_id, time__lte=max_time_id, region=region) \
            .values('region', 'time') \
            .annotate(reserved=Count('*')) \
            .annotate(region_id=F('region')) \
            .annotate(time_id=F('time')) \
            .values('region_id', 'time_id', 'reserved')
        serializer = RegionReservationSerializer(reserved_time, many=True)
        return Response(serializer.data)


class QueryRegionGroupReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time_id", OpenApiTypes.INT),
            OpenApiParameter("max_time_id", OpenApiTypes.INT),
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
