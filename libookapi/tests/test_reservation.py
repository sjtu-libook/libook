import pytest
import json
from rest_framework.test import APIClient
from datetime import datetime, timedelta
from pytz import timezone
from django.utils.timezone import now
from ..models import *
from ..serializers import *


@pytest.mark.django_db
def test_batch_reservation():
    """可以批量预定"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    timeslice1 = Timeslice.objects.create(
        from_time=now() + timedelta(days=1),
        to_time=now() + timedelta(days=1, hours=1))
    timeslice2 = Timeslice.objects.create(
        from_time=now() + timedelta(days=2),
        to_time=now() + timedelta(days=2, hours=1))
    user = User.objects.create(username="Alex Chi")

    client = APIClient()
    client.force_authenticate(user=user)

    reservations = [{"region": region.id, "time": timeslice1.id},
                    {"region": region.id, "time": timeslice2.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    print(response.json())
    assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice1).data, "reason": ""}, {
        "region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice2).data, "reason": ""}]
    assert response.status_code == 201


@pytest.mark.django_db
def test_batch_reservation_failed():
    """提供非法信息时预定会失败"""

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
    """只能查询到自己的预定"""

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


@pytest.mark.django_db
def test_reservation_delete():
    """可以删除预定"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=now(),
        to_time=now() + timedelta(hours=1))
    user1 = User.objects.create(username="Alex Chi")
    r1 = Reservation.objects.create(user=user1, time=timeslice1, region=region)

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.get(f'/api/reservations/')
    assert response.status_code == 200
    assert response.json() != []

    response = client.delete(f'/api/reservations/{r1.id}/')
    assert response.status_code == 204

    response = client.get(f'/api/reservations/')
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_reservation_post_only_self():
    """只能提交自己的预定"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=tz.localize(datetime.today() + timedelta(days=1)),
        to_time=tz.localize(datetime.today() + timedelta(days=1, hours=1)))
    user1 = User.objects.create(username="Alex Chi")
    user2 = User.objects.create(username="Bob Chi")

    client = APIClient()
    client.force_authenticate(user=user1)

    reservations = [{"region": region.id,
                     "time": timeslice1.id, "user": user2.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.status_code == 201

    # 即使指定了 user 参数，这个预定最终也会添加到自己的用户下。
    response = client.get(f'/api/reservations/')
    assert response.status_code == 200
    assert response.json() != []


@pytest.mark.django_db
def test_batch_reservation_failed_01():
    """1. 用户只能在预定时间片起始时间之前订位"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice = Timeslice.objects.create(
        from_time=tz.localize(datetime(1999, 1, 1, 8, 0, 0)),
        to_time=tz.localize(datetime(1999, 1, 1, 9, 0, 0)))
    user = User.objects.create(username="Zihan")

    client = APIClient()
    client.force_authenticate(user=user)

    reservations = [{"region": region.id, "time": timeslice.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.status_code == 400
    assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(
        region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": "预定失败！您不能预定过去的位置"}]


@pytest.mark.django_db
def test_batch_reservation_failed_02():
    """2. 一个场地的预定数不能超过场地限制"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=2, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice = Timeslice.objects.create(
        from_time=tz.localize(datetime.today() + timedelta(days=1)),
        to_time=tz.localize(datetime.today() + timedelta(days=2)))
    user1 = User.objects.create(username="Zihan")
    user2 = User.objects.create(username="Alex Chi")
    user3 = User.objects.create(username="Bob Chi")

    for user in [user1, user2, user3]:
        client = APIClient()
        client.force_authenticate(user=user)
        reservations = [{"region": region.id, "time": timeslice.id}]
        response = client.post(f'/api/reservations/batch',
                               json.dumps(reservations),
                               content_type='application/json'
                               )
        if user == user3:
            assert response.status_code == 400
            assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(
                region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": "预定失败！该区域在该时间段已预定满"}]
        else:
            assert response.status_code == 201
            if user == user1:
                assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(
                    region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": ""}]
            else:
                assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(
                    region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": ""}]


@pytest.mark.django_db
def test_batch_reservation_failed_03():
    """3. 用户在同一个时间段只能预定一个场地"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=10, group=group)
    region2 = Region.objects.create(name="新图 A100", capacity=10, group=group)
    timeslice = Timeslice.objects.create(
        from_time=now() + timedelta(days=1),
        to_time=now() + timedelta(days=1, hours=1))
    user = User.objects.create(username="Zihan")

    client = APIClient()
    client.force_authenticate(user=user)
    reservations = [{"region": region1.id, "time": timeslice.id}]
    client.post(f'/api/reservations/batch',
                json.dumps(reservations),
                content_type='application/json')
    reservations = [{"region": region2.id, "time": timeslice.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json')
    assert response.status_code == 400
    assert response.json() == [{"region": {"id": region2.id, "name": region2.name, "group": RegionGroupSerializer(
        region2.group).data, "capacity": region2.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": "预定失败！您在该时间段已预定了一个位置"}]


@pytest.mark.django_db
def test_batch_reservation_failed_04():
    """4. 用户只能预定接下来一周的场地"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=10, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice = Timeslice.objects.create(
        from_time=now() + timedelta(days=10),
        to_time=now() + timedelta(days=11))
    user = User.objects.create(username="Zihan")

    client = APIClient()
    client.force_authenticate(user=user)
    reservations = [{"region": region.id, "time": timeslice.id}]
    response = client.post(f'/api/reservations/batch',
                           json.dumps(reservations),
                           content_type='application/json'
                           )
    assert response.status_code == 400
    assert response.json() == [{"region": {"id": region.id, "name": region.name, "group": RegionGroupSerializer(
        region.group).data, "capacity": region.capacity}, "time": TimesliceSerializer(timeslice).data, "reason": "预定失败！您只能预定未来一周的位置"}]


@pytest.mark.django_db
def test_reservation_delete_before():
    """只能在预定时间段结束前取消预定"""

    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    tz = timezone('Asia/Shanghai')
    timeslice1 = Timeslice.objects.create(
        from_time=now() - timedelta(hours=1),
        to_time=now() - timedelta(seconds=5))
    user1 = User.objects.create(username="Alex Chi")
    r1 = Reservation.objects.create(user=user1, time=timeslice1, region=region)

    client = APIClient()
    client.force_authenticate(user=user1)

    response = client.delete(f'/api/reservations/{r1.id}/')
    assert response.status_code == 400
