from django.db import models
from django.contrib.auth.models import User


class UserInfo(models.Model):
    """
    用户是进行操作的最小单位。
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fingerprint_id = models.IntegerField(help_text="指纹 ID", null=True)
    face_id = models.IntegerField(help_text="面部图像 ID", null=True)


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
        RegionGroup, related_name='regions', on_delete=models.CASCADE, help_text="区域所属区域组")
    capacity = models.IntegerField(help_text="区域最大可容纳人数")

    class Meta:
        indexes = [
            models.Index(fields=['group']),
        ]


class Timeslice(models.Model):
    """
    时间片是用户可以预定的最小时间单位。时间片含有起始时间与终止时间。
    时间片的 id 必须根据起始时间排序。如果 id_1 < id_2，那么 from_time_1 < from_time_2。
    时间片不能重叠。
    """
    id = models.AutoField(primary_key=True, help_text="时间片唯一 ID")
    from_time = models.DateTimeField(help_text="时间片起始时间")
    to_time = models.DateTimeField(help_text="时间片终止时间")

    class Meta:
        indexes = [
            models.Index(fields=['from_time']),
            models.Index(fields=['to_time'])
        ]


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

    class Meta:
        indexes = [
            models.Index(fields=['region', 'time']),
            models.Index(fields=['user']),
            models.Index(fields=['time']),
        ]


class Device(models.Model):
    """
    设备对应现实世界中放置在图书馆座位上的硬件。
    """
    id = models.AutoField(primary_key=True, help_text="设备 ID")
    api_key = models.CharField(max_length=64, help_text="设备 API Key")
    region = models.ForeignKey(
        Region, on_delete=models.CASCADE, help_text="设备所在区域")


class UserToken(models.Model):
    """
    一次性验证 Token 是用户第一次落座时输入的一串数字。可以用于绑定指纹和身份。
    """
    id = models.AutoField(primary_key=True, help_text="Token ID")
    token = models.CharField(max_length=64, help_text="Token", unique=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, help_text="对应用户")
    expires_at = models.DateTimeField(help_text="Token 过期时间")
