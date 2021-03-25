import pytest
from django.test import Client

from ..models import Region, RegionGroup


@pytest.mark.django_db
def test_get_region():
    """创建的 Region 可以通过接口获取到"""
    group = RegionGroup.objects.create(name="新图 1 楼")
    region = Region.objects.create(name="新图 E100", capacity=100, group=group)
    client = Client()
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
    client = Client()
    response = client.get(f'/api/region_groups/{group.id}/detail')
    assert response.status_code == 200
    assert response.json() == {"id": group.id, "name": group.name, "capacity": 150, "regions": [
        {"id": region1.id, "name": region1.name,
            "group": group.id, "capacity": region1.capacity},
        {"id": region2.id, "name": region2.name, "group": group.id, "capacity": region2.capacity}]}
