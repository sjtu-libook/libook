from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import viewsets, permissions, views, generics
from rest_framework.decorators import action
from .serializers import RegionGroupSerializer, RegionSerializer, ReservationSerializer
from .models import RegionGroup, Region, Reservation


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
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend]


class BatchReservationView(generics.ListAPIView):
    def get(self, request, format=None):
        """
        获取当前用户的所有预定信息。
        """
        user = self.request.user
        return Reservation.objects.filter(user=user)

    def post(self, request, format=None):
        """
        批量订位
        1. 用户只能在预约时间之前更改预约信息
        2. 一个场地的预约数不能超过场地限制
        3. 用户在同一个时间段只能预约一个场地
        4. ...
        """
        pass

    def delete(self, request):
        """
        批量取消订位
        """
        pass


class UserView(views.APIView):
    def get(self, request, format=None):
        """
        获取当前用户信息
        """
        pass
