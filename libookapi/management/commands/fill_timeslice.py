from django.core.management.base import BaseCommand
from pytz import timezone
from tzlocal import get_localzone
from datetime import date, datetime, timedelta
from ...models import Timeslice


class Command(BaseCommand):
    help = '生成一整年的时间片。'

    def add_arguments(self, parser):
        parser.add_argument('--open_time',
                            default=7,
                            type=int,
                            help='Open time every day in hour')
        parser.add_argument('--close_time',
                            default=23,
                            type=int,
                            help='Close time every day in hour')

    def handle(self, open_time, close_time, *args, **options):
        today = date.today()
        tz = get_localzone()
        Timeslice.objects.all().delete()
        for i in range(365):
            for hour in range(open_time, close_time):
                from_time = datetime(
                    today.year, today.month, today.day, hour, 0, 0)
                to_time = datetime(
                    today.year, today.month, today.day, hour + 1, 0, 0)
                timeslice = Timeslice(from_time=tz.localize(
                    from_time), to_time=tz.localize(to_time))
                timeslice.save()
            today = today + timedelta(days=1)
            print(today)
