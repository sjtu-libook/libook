# Generated by Django 3.1.7 on 2021-03-14 08:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('libookapi', '0006_auto_20210314_0807'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInfo',
            fields=[
                ('id', models.AutoField(auto_created=True,
                                        primary_key=True, serialize=False, verbose_name='ID')),
                ('sid', models.CharField(max_length=20, unique=True)),
                ('name', models.CharField(max_length=20)),
                ('fingerprint_id', models.IntegerField(
                    help_text='指纹 ID', null=True)),
                ('face_id', models.IntegerField(help_text='面部图像 ID', null=True)),
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='reservation',
            name='user',
            field=models.ForeignKey(
                help_text='预定用户', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='usertoken',
            name='user',
            field=models.ForeignKey(
                help_text='对应用户', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='BookUser',
        ),
    ]
