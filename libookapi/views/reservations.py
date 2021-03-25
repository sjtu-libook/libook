from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F, Value, IntegerField, Sum, OuterRef, Subquery
from itertools import chain

from ..serializers import *
from ..models import *


class ReservationFilter(django_filters.FilterSet):
    from_time__gte = django_filters.DateTimeFilter(
        field_name='time__from_time', lookup_expr='gte')
    from_time__lte = django_filters.DateTimeFilter(
        field_name='time__from_time', lookup_expr='lte')

    class Meta:
        model = Reservation
        fields = ['id', 'region', 'time']


class ReservationView(mixins.ListModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    """
    获取、删除单个预约信息。
    """

    def get_queryset(self):
        user = self.request.user
        return user.reservation_set.all()

    serializer_class = ReservationDetailSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ReservationFilter


class QueryRegionReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time_id", OpenApiTypes.INT),
            OpenApiParameter("max_time_id", OpenApiTypes.INT),
            OpenApiParameter("region_id", OpenApiTypes.INT),
        ],
        responses=RegionReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询区域的预约情况，返回一个数组，代表该区域在 [min_time_id, max_time_id]
        每个时间段内的预约情况。
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
            OpenApiParameter("region_group_id", OpenApiTypes.INT),
        ],
        responses=RegionReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询某一区域组的预约情况，返回一个数组，代表在该区域组里的每一个区域在
        [min_time_id, max_time_id] 每个时间段内的预约情况。
        """
        group = request.GET.get('region_group_id')
        min_time_id = request.GET.get('min_time_id')
        max_time_id = request.GET.get('max_time_id')
        reserved_time = Reservation.objects \
            .filter(time__gte=min_time_id, time__lte=max_time_id, region__group=group) \
            .values('region', 'time') \
            .annotate(reserved=Count('*')) \
            .annotate(region_id=F('region')) \
            .annotate(time_id=F('time')) \
            .values('region_id', 'time_id', 'reserved')
        serializer = RegionReservationSerializer(reserved_time, many=True)
        return Response(serializer.data)


class QueryAllRegionGroupReservationView(views.APIView):
    @extend_schema(
        parameters=[
            OpenApiParameter("min_time_id", OpenApiTypes.INT),
            OpenApiParameter("max_time_id", OpenApiTypes.INT)
        ],
        responses=RegionGroupReservationSerializer(many=True),
    )
    def get(self, request):
        """
        查询所有区域组的预约情况，返回一个数组，代表各个区域组在
        [min_time_id, max_time_id] 每个时间段内的预约情况。
        """
        min_time_id = request.GET.get('min_time_id')
        max_time_id = request.GET.get('max_time_id')
        groups = RegionGroup.objects.all()
        reserved_time = Reservation.objects \
            .filter(time__gte=min_time_id, time__lte=max_time_id) \
            .values('region__group', 'time') \
            .annotate(reserved=Count('*')) \
            .annotate(region_group_id=F('region__group')) \
            .annotate(time_id=F('time')) \
            .values('region_group_id', 'time_id', 'reserved')
        serializer = RegionReservationSerializer(reserved_time, many=True)
        serializer = RegionGroupReservationSerializer(reserved_time, many=True)
        return Response(serializer.data)


class BatchReservationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ReservationSerializer(many=True),
        responses=ReservationSerializer(many=True),
    )
    def post(self, request, format=None):
        """
        TODO: 实现预定逻辑
        批量订位/取消订位
        1. 用户只能在预约时间之前更改预约信息
        2. 一个场地的预约数不能超过场地限制
        3. 用户在同一个时间段只能预约一个场地
        4. ...
        """
        serializer = ReservationSerializer(
            data=request.data, many=True, context={'request': request})
        if serializer.is_valid():
            # TODO: 增加更多的检测
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
