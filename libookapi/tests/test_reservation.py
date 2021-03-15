import pytest
import json
from rest_framework.test import APIClient
from datetime import datetime
from pytz import timezone
from ..models import *
from ..serializers import ReservationDetailSerializer


@pytest.mark.django_db
def test_batch_reservation():
    """可以批量预约"""
    # TODO: 加入重复预约、超过限制等错误情况的测试

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 8, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)))
    timeslice2 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 10, 0, 0)))
    user = User.objects.create(username="Alex Chi")

    client = APIClient()
    client.force_authenticate(user=user)

    reservations = [{"region": region.id, "time": timeslice1.id},
                    {"region": region.id, "time": timeslice2.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.json() == [{"id": 1, "region": region.id, "time": timeslice1.id},
                               {"id": 2, "region": region.id, "time": timeslice2.id}]
    assert response.status_code == 201


@pytest.mark.django_db
def test_batch_reservation_failed():
    """提供非法信息时预约会失败"""

    user = User.objects.create(username="Alex Chi")

    client = APIClient()
    client.force_authenticate(user=user)

    reservations = [{"region": 1, "time": 3, "test": 233},
                    {"region": 2, "time": 4}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.status_code == 400


@pytest.mark.django_db
def test_reservation_get_only_self():
    """只能查询到自己的预约"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 8, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)))
    timeslice2 = Timeslice.objects.create(
        from_time=tz.localize(datetime(2021, 3, 13, 9, 0, 0)),
        to_time=tz.localize(datetime(2021, 3, 13, 10, 0, 0)))
    user1 = User.objects.create(username="Alex Chi")
    user2 = User.objects.create(username="Bob Chi")
    r1 = Reservation.objects.create(user=user1, time=timeslice1, region=region)
    r2 = Reservation.objects.create(user=user1, time=timeslice2, region=region)
    r3 = Reservation.objects.create(user=user2, time=timeslice2, region=region)

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.get(f'/api/reservations/')
    assert response.status_code == 200
    assert response.json() == [ReservationDetailSerializer(
        r1).data, ReservationDetailSerializer(r2).data]

    response = client.get(f'/api/reservations/',
                          {'from_time__lte': timeslice1.from_time})
    assert response.status_code == 200
    assert response.json() == [ReservationDetailSerializer(r1).data]

    response = client.get(f'/api/reservations/',
                          {'from_time__gte': timeslice2.from_time})
    assert response.status_code == 200
    assert response.json() == [ReservationDetailSerializer(r2).data]
