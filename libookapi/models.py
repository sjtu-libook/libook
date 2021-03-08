from django.db import models


class User(models.Model):
    id = models.AutoField(primary_key=True)
    sid = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=20)


class Region(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=20)
    capacity = models.IntegerField()


class Timeslice(models.Model):
    id = models.AutoField(primary_key=True)
    from_time = models.DateTimeField()
    to_time = models.DateTimeField()


class Reservation(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    time = models.ForeignKey(Timeslice, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

