# Generated by Django 3.1.7 on 2021-03-08 14:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('libookapi', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='region',
            name='capacity',
            field=models.IntegerField(help_text='区域最大可容纳人数'),
        ),
        migrations.AlterField(
            model_name='region',
            name='group',
            field=models.ForeignKey(
                help_text='区域所属区域组', on_delete=django.db.models.deletion.CASCADE, to='libookapi.regiongroup'),
        ),
        migrations.AlterField(
            model_name='region',
            name='id',
            field=models.AutoField(help_text='区域唯一 ID',
                                   primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='region',
            name='name',
            field=models.CharField(help_text='区域名称', max_length=20),
        ),
        migrations.AlterField(
            model_name='regiongroup',
            name='id',
            field=models.AutoField(help_text='区域组唯一 ID',
                                   primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='regiongroup',
            name='name',
            field=models.CharField(help_text='区域组名称', max_length=20),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, help_text='预定创建时间'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='id',
            field=models.AutoField(help_text='预定唯一 ID',
                                   primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='region',
            field=models.ForeignKey(
                help_text='预定区域', on_delete=django.db.models.deletion.CASCADE, to='libookapi.region'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='time',
            field=models.ForeignKey(
                help_text='预定时间', on_delete=django.db.models.deletion.CASCADE, to='libookapi.timeslice'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, help_text='预定更新时间'),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='user',
            field=models.ForeignKey(
                help_text='预定用户', on_delete=django.db.models.deletion.CASCADE, to='libookapi.user'),
        ),
        migrations.AlterField(
            model_name='timeslice',
            name='from_time',
            field=models.DateTimeField(help_text='时间片起始时间'),
        ),
        migrations.AlterField(
            model_name='timeslice',
            name='id',
            field=models.AutoField(help_text='时间片唯一 ID',
                                   primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='timeslice',
            name='to_time',
            field=models.DateTimeField(help_text='时间片终止时间'),
        ),
    ]
