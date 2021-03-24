from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import viewsets, permissions, views, generics, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.db.models import Count, F, Value, IntegerField
from itertools import chain
from datetime import datetime, timedelta
from pytz import timezone
import pytz

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
        reserved_time = Reservation.objects.none()
        for group in groups:
            regions = group.regions.all()
            capacity = 0
            for region in regions:
                capacity += region.capacity
            curr_reserved_time = Reservation.objects \
                .filter(time__gte=min_time_id, time__lte=max_time_id, region__group=group) \
                .values('time') \
                .annotate(reserved=Count('*')) \
                .annotate(capacity=Value(capacity, output_field=IntegerField())) \
                .annotate(time_id=F('time')) \
                .annotate(region_group_id=Value(group.id, output_field=IntegerField())) \
                .values('reserved', 'capacity', 'time_id', 'region_group_id')
            reserved_time = chain(reserved_time, curr_reserved_time)
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
        实现批量订位
        1. 用户只能在预约时间片起始时间之前订位
        2. 一个场地的预约数不能超过场地限制
        3. 用户在同一个时间段只能预约一个场地
        4. 用户只能预约接下来一周的场地
        5. ... to be continued
        """
        serializer = ReservationSerializer(
            data=request.data, many=True, context={'request': request})
        if serializer.is_valid():
            '''检测请求是否有效'''
            for i in range(len(serializer.data)):

                # 1. 用户只能在预约时间片起始时间之前订位
                reserve_timeslice = Timeslice.objects.get(
                    id=serializer.data[i]['time'])
                tz = timezone('Asia/Shanghai')
                reserve_fromtime = reserve_timeslice.from_time.replace(
                    tzinfo=pytz.utc).astimezone(tz)
                reserve_totime = reserve_timeslice.to_time.replace(
                    tzinfo=pytz.utc).astimezone(tz)
                curr_time = tz.localize(datetime.today())
                if curr_time > reserve_fromtime:
                    message = {'message': '预约失败！您不能预约过去的位置'}
                    serializer = ErrorSerializer(message)
                    return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)

                # 2. 一个场地的预约数不能超过场地限制
                reserve_region = Region.objects.get(
                    id=serializer.data[i]['region'])
                reserve_num = len(Reservation.objects.filter(
                    region=reserve_region, time=reserve_timeslice))
                if reserve_num >= reserve_region.capacity:
                    message = {'message': f"预约失败！区域「{reserve_region.name}」在时间段"
                               f"「{reserve_fromtime.strftime('%Y-%m-%d %H:00')} ~ "
                               f"{reserve_totime.strftime('%H:00')}」已预约满"}
                    serializer = ErrorSerializer(message)
                    return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)

                # 3. 用户在同一个时间段只能预约一个场地
                if len(Reservation.objects.filter(user=request.user, time=reserve_timeslice)) > 0:
                    message = {'message': "预约失败！您在时间段「"
                               f"{reserve_fromtime.strftime('%Y-%m-%d %H:00')} ~ "
                               f"{reserve_totime.strftime('%H:00')}」已预约了一个位置"}
                    serializer = ErrorSerializer(message)
                    return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)

                # 4. 用户只能预约接下来一周的场地
                if reserve_fromtime > tz.localize(datetime.today()) + timedelta(days=7):
                    message = {'message': '预约失败！您只能预约未来一周的位置'}
                    serializer = ErrorSerializer(message)
                    return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
