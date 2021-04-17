import pytest
from rest_framework.test import APIClient
from datetime import datetime
from pytz import timezone
from ..models import *


@pytest.mark.django_db
def test_reservation_region_query():
    """可以查询某一时间的区域预定情况"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    time = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 11, 10)), to_time=tz.localize(datetime(2021, 3, 11, 11)))

    # Two users reserve the same region and time
    user = User.objects.create(username="AAA")
    Reservation.objects.create(user=user, region=region, time=time)

    user = User.objects.create(username="BBB")
    Reservation.objects.create(user=user, region=region, time=time)

    client = APIClient()
    response = client.get(f'/api/reservations/by_region',
                          {'region_id': region.id, 'min_time_id': time.id, 'max_time_id': time.id})
    assert response.status_code == 200
    assert response.json() == [
        {'reserved': 2, 'time_id': time.id, 'region_id': region.id}]


@pytest.mark.django_db
def test_reservation_region_group_query():
    """可以查询某一时间的某一区域组预定情况"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=100, group=group)
    region2 = Region.objects.create(name="新图 A100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    time1 = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 11, 10)), to_time=tz.localize(datetime(2021, 3, 11, 11)))
    time2 = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 12, 10)), to_time=tz.localize(datetime(2021, 3, 12, 11)))

    # Three users reserve different regions and time
    user = User.objects.create(username="AAA")
    Reservation.objects.create(user=user, region=region1, time=time1)

    user = User.objects.create(username="BBB")
    Reservation.objects.create(user=user, region=region1, time=time2)

    user = User.objects.create(username="CCC")
    Reservation.objects.create(user=user, region=region2, time=time1)

    client = APIClient()
    response = client.get(f'/api/reservations/by_region_group',
                          {'region_group_id': group.id, 'min_time_id': time1.id, 'max_time_id': time2.id})
    assert response.status_code == 200
    assert response.json() == [
        {'reserved': 1, 'time_id': time1.id, 'region_id': region1.id},
        {'reserved': 1, 'time_id': time2.id, 'region_id': region1.id},
        {'reserved': 1, 'time_id': time1.id, 'region_id': region2.id}
    ]


@pytest.mark.django_db
def test_all_reservation_region_group_query():
    """可以查询某一时间的所有区域组预定情况"""
    group1 = RegionGroup.objects.create(name="新图 1 楼")
    group2 = RegionGroup.objects.create(name="新图 2 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=100, group=group1)
    region2 = Region.objects.create(name="新图 A100", capacity=50, group=group1)
    region3 = Region.objects.create(name="新图 E200", capacity=120, group=group2)
    region4 = Region.objects.create(name="新图 A200", capacity=60, group=group2)
    tz = timezone('Asia/Shanghai')
    time1 = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 11, 10)), to_time=tz.localize(datetime(2021, 3, 11, 11)))
    time2 = Timeslice.objects.create(from_time=tz.localize(
        datetime(2021, 3, 12, 10)), to_time=tz.localize(datetime(2021, 3, 12, 11)))

    # Five users reserve in different ways
    user = User.objects.create(username="AAA")
    Reservation.objects.create(user=user, region=region1, time=time1)

    user = User.objects.create(username="BBB")
    Reservation.objects.create(user=user, region=region2, time=time1)

    user = User.objects.create(username="CCC")
    Reservation.objects.create(user=user, region=region2, time=time2)

    user = User.objects.create(username="DDD")
    Reservation.objects.create(user=user, region=region3, time=time1)

    user = User.objects.create(username="EEE")
    Reservation.objects.create(user=user, region=region4, time=time2)

    client = APIClient()
    response = client.get(f'/api/reservations/by_all',
                          {'min_time_id': time1.id, 'max_time_id': time2.id})
    assert response.status_code == 200
    assert response.json() == [
        {'reserved': 2, 'time_id': time1.id,
            'region_group_id': group1.id},
        {'reserved': 1, 'time_id': time2.id,
            'region_group_id': group1.id},
        {'reserved': 1, 'time_id': time1.id,
            'region_group_id': group2.id},
        {'reserved': 1, 'time_id': time2.id,
            'region_group_id': group2.id}
    ]
