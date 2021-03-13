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
