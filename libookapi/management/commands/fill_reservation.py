from django.core.management.base import BaseCommand
from ...models import Region, RegionGroup


class Command(BaseCommand):
    help = '生成用于测试的预定信息。'

    def handle(self, *args, **options):
        """生成用于测试的预定信息。

        TODO: 需要编写内容。

        首先，我们需要生成一批测试用户（并删除之前生成的测试用户）。可以考虑在
        `UserInfo` 里加一个 field 表示该用户是实际注册的用户，还是我们生成
        的测试用户。之后，我们可以根据某一分布（比如下午晚上人多、早上人少），
        随机生成这些用户的预定信息。
        """
        pass
