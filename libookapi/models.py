from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    sid = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=20)


class RegionGroup(models.Model):
    """
    区域组中含有许多区域。一个区域组可以是一个楼层、一个阅览室等等。
    """
    id = models.AutoField(primary_key=True, help_text="区域组唯一 ID")
    name = models.CharField(max_length=20, help_text="区域组名称")


class Region(models.Model):
    """
    区域是用户预定的最小空间单位。区域通常是一个房间、一张桌子。
    """
    id = models.AutoField(primary_key=True, help_text="区域唯一 ID")
    name = models.CharField(max_length=20, help_text="区域名称")
    group = models.ForeignKey(
        RegionGroup, on_delete=models.CASCADE, help_text="区域所属区域组")
    capacity = models.IntegerField(help_text="区域最大可容纳人数")


class Timeslice(models.Model):
    """
    时间片是用户可以预定的最小时间单位。时间片含有起始时间与终止时间。
    时间片的 id 必须根据起始时间排序。如果 id_1 < id_2，那么 from_time_1 < from_time_2。
    时间片不能重叠。
    """
    id = models.AutoField(primary_key=True, help_text="时间片唯一 ID")
    from_time = models.DateTimeField(help_text="时间片起始时间")
    to_time = models.DateTimeField(help_text="时间片终止时间")


class Reservation(models.Model):
    """
    预定信息保存了用户预定的内容。包括用户预定的时间、预定的区域等等。
    """
    id = models.AutoField(primary_key=True, help_text="预定唯一 ID")
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="预定用户")
    region = models.ForeignKey(
        Region, on_delete=models.CASCADE, help_text="预定区域")
    time = models.ForeignKey(
        Timeslice, on_delete=models.CASCADE, help_text="预定时间")
    created_at = models.DateTimeField(auto_now_add=True, help_text="预定创建时间")
    updated_at = models.DateTimeField(auto_now=True, help_text="预定更新时间")
