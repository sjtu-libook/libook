import pytest
from django.test import Client
from datetime import datetime
from pytz import timezone
from ..models import *


@pytest.mark.django_db
def test_reservation_region_query():
    """可以查询某一时间的区域预约情况"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    time = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 11, 10)), to_time=tz.localize(datetime(2021, 3, 11, 11)))

    # Two users reserve the same area
    user = User.objects.create(username="AAA")
    Reservation.objects.create(user=user, region=region, time=time)

    user = User.objects.create(username="BBB")
    Reservation.objects.create(user=user, region=region, time=time)

    client = Client()
    response = client.get(f'/api/reservations/by_region',
                          {'region_id': region.id, 'min_time_id': time.id, 'max_time_id': time.id})
    assert response.status_code == 200
    assert response.json() == [
        {'reserved': 2, 'time_id': time.id, 'region_id': region.id}]


@pytest.mark.django_db
def test_reservation_region_group_query():
    """可以查询某一时间的区域组预约情况"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=100, group=group)
    region2 = Region.objects.create(name="新图 E101", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    time = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 11, 10)), to_time=tz.localize(datetime(2021, 3, 11, 11)))

    # Two users reserve different regions in the same region_group
    user = User.objects.create(username="AAA")
    Reservation.objects.create(user=user, region=region1, time=time)

    user = User.objects.create(username="BBB")
    Reservation.objects.create(user=user, region=region2, time=time)

    client = Client()
    response = client.get(f'/api/reservations/by_region_group',
                          {'region_group_id': region1.group.id, 'min_time_id': time.id, 'max_time_id': time.id})
    assert region1.group.id == region2.group.id
    assert response.status_code == 200
    assert response.json() == [
        {'reserved': 2, 'time_id': time.id, 'region_group_id': region1.group.id, 'capacity': region1.capacity + region2.capacity}]