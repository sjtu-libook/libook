import pytest
from rest_framework.test import APIClient
from django.utils.timezone import now
from datetime import timedelta
from ..models import Region, RegionGroup, Timeslice, Reservation, User
from assertpy import assert_that


@pytest.mark.django_db
def test_get_region():
    """创建的 Region 可以通过接口获取到"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    client = APIClient()
    response = client.get(f'/api/regions/{region.id}/')
    assert response.status_code == 200
    assert response.json() == {"id": region.id, "name": "新图 E100",
                               "group": group.id, "capacity": region.capacity}


@pytest.mark.django_db
def test_get_region_detail():
    """可以获取区域组的详细信息"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=100, group=group)
    region2 = Region.objects.create(name="新图 E200", capacity=50, group=group)
    client = APIClient()

    response = client.get(f'/api/region_groups/')
    assert response.status_code == 200
    assert response.json() == [
        {"id": group.id, "name": group.name, "capacity": 150}]

    response = client.get(f'/api/region_groups/{group.id}/detail')
    assert response.status_code == 200
    assert response.json() == {"id": group.id, "name": group.name, "capacity": 150, "regions": [
        {"id": region1.id, "name": region1.name,
            "group": group.id, "capacity": region1.capacity},
        {"id": region2.id, "name": region2.name, "group": group.id, "capacity": region2.capacity}]}


@pytest.mark.django_db
def test_get_region_recommend():
    """可以获取推荐的区域"""
    group1 = RegionGroup.objects.create(name="新图 1 楼")
    group2 = RegionGroup.objects.create(name="新图 2 楼")
    region1 = Region.objects.create(name="新图 E100", capacity=100, group=group1)
    region2 = Region.objects.create(name="新图 E200", capacity=50, group=group1)
    region3 = Region.objects.create(name="新图 E300", capacity=50, group=group2)
    user = User.objects.create(username="Alex Chi")
    current_time = now()
    time = Timeslice.objects.create(
        from_time=current_time, to_time=current_time + timedelta(hours=1))

    client = APIClient()
    client.force_authenticate(user=user)

    Reservation.objects.create(time=time, user=user, region=region1)
    response = client.get(f'/api/region_groups/recommendation')
    assert response.status_code == 200
    assert assert_that(response.json()).extracting(
        'id').is_equal_to([group1.id])

    Reservation.objects.create(time=time, user=user, region=region2)
    response = client.get(f'/api/region_groups/recommendation')
    assert response.status_code == 200
    assert assert_that(response.json()).extracting(
        'id').is_equal_to([group1.id])

    Reservation.objects.create(time=time, user=user, region=region3)
    response = client.get(f'/api/region_groups/recommendation')
    assert response.status_code == 200
    assert assert_that(response.json()).extracting(
        'id').is_equal_to([group1.id, group2.id])
