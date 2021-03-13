from django.core.management.base import BaseCommand
from pytz import timezone
from tzlocal import get_localzone
from datetime import date, datetime, timedelta
from ...models import Timeslice


class Command(BaseCommand):
    help = '生成一整年的时间片。'

    def handle(self, *args, **options):
        today = date.today()
        tz = timezone('Asia/Shanghai')
        Timeslice.objects.all().delete()
        for i in range(365):
            if today.weekday() >= 5:
                # open from 8pm to 10pm on weekends
                open_range = range(8, 22)
            else:
                # open from 7pm to 11pm on weekdays
                open_range = range(7, 23)

            for hour in open_range:
                from_time = tz.localize(datetime(
                    today.year, today.month, today.day, hour, 0, 0))
                to_time = tz.localize(datetime(
                    today.year, today.month, today.day, hour + 1, 0, 0))
                timeslice = Timeslice(from_time=from_time, to_time=to_time)
                timeslice.save()
            today = today + timedelta(days=1)
            print(today)
