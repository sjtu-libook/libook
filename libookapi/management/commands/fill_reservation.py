from django.core.management.base import BaseCommand
from django.db import transaction
from ...models import Region, RegionGroup, User, Timeslice, Reservation
from datetime import date, datetime, timedelta
from pytz import timezone
import random


class Command(BaseCommand):
    help = '生成用于测试的预定信息。'

    @transaction.atomic
    def handle(self, *args, **options):
        """生成用于测试的预定信息。"""
        User.objects.filter(username__startswith="test-user-").delete()
        print("Generating users...")
        users = list(map(lambda id: User.objects.create(
            username=f"test-user-{id}"), range(2000)))

        tz = timezone('Asia/Shanghai')
        today = date.today()

        for day in range(30):
            start_of_day = tz.localize(datetime(
                today.year, today.month, today.day, 0, 0, 0))
            end_of_day = start_of_day + timedelta(days=1)
            timeslices = list(
                Timeslice.objects
                .filter(from_time__gte=start_of_day, from_time__lte=end_of_day)
                .order_by('id'))
            regions = list(Region.objects.all())

            records = 0

            for user in users:
                from_time = random.randrange(0, len(timeslices))
                to_time = random.randrange(0, len(timeslices))
                from_time, to_time = min(
                    from_time, to_time), max(from_time, to_time)
                region = random.sample(regions, 1)[0]
                if region.capacity > 0:
                    region.capacity -= 1
                else:
                    continue

                for time in range(from_time, to_time + 1):
                    Reservation.objects.create(
                        user=user, region=region, time=timeslices[time])
                    records += 1

            today += timedelta(days=1)
            print(f"{start_of_day}, {len(users)} users, {records} records")
