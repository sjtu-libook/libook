# Generated by Django 3.1.7 on 2021-03-13 15:15

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('libookapi', '0004_auto_20210313_1058'),
    ]

    operations = [
        migrations.AlterField(
            model_name='region',
            name='group',
            field=models.ForeignKey(help_text='区域所属区域组', on_delete=django.db.models.deletion.CASCADE,
                                    related_name='regions', to='libookapi.regiongroup'),
        ),
    ]
