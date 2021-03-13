from django.core.management.base import BaseCommand
from ...models import Region, RegionGroup


class Command(BaseCommand):
    help = '生成上海交通大学图书馆主馆的区域和区域组信息。'

    def handle(self, *args, **options):
        RegionGroup.objects.all().delete()
        Region.objects.all().delete()

        for quiet_room in ["A200", "B200", "C200", "A300", "B300", "C300", "A400", "B400", "C400"]:
            group = RegionGroup(name=f"新图 {quiet_room}")
            group.save()
            for table in range(50):
                region = Region(name=f"{table + 1} 号桌",
                                group=group, capacity=8)
                region.save()

        for corridor in ["2", "3", "4"]:
            group = RegionGroup(name=f"新图 {corridor} 楼非安静区")
            group.save()
            for table in range(40):
                region = Region(name=f"{table + 1} 号桌",
                                group=group, capacity=4)
                region.save()

        rooms = ["A215", "A216", "A315", "A316", "A415", "A416", "B215", "B216", "B315", "B316", "B415",
                 "B416", "C315", "C316", "E210", "E211", "E216", "E309", "E310", "E311", "E312", "E316"]
        capacities = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
                      8, 8, 8, 20, 15, 14, 12, 10, 10, 12, 12]

        for floor in [2, 3, 4]:
            group = RegionGroup(name=f"新图 {floor} 楼小组自习室")
            group.save()

            for room, capacity in zip(rooms, capacities):
                if int(room[1]) == floor:
                    region = Region(name=room, group=group, capacity=capacity)
                    region.save()
