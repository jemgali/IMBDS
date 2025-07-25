# Generated by Django 5.1.7 on 2025-07-03 10:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_report_marker_location'),
    ]

    operations = [
        migrations.AddField(
            model_name='report',
            name='business',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='api.business'),
        ),
        migrations.AddField(
            model_name='report',
            name='investible',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='api.investible'),
        ),
        migrations.AlterField(
            model_name='marker',
            name='location',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
