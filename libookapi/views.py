from django.shortcuts import render

from rest_framework import viewsets
from .serializers import ReservationSerializer
from .models import Reservation


class ReservationView(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    queryset = Reservation.objects.all()

    """订位逻辑
        1. 用户只能在预约时间之前更改预约信息
        2. 一个场地的预约数不能超过场地限制
        3. 用户在同一个时间段只能预约一个场地
        4. ...
    """
