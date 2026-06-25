from django.db import models

class ShadowLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    request_payload = models.JSONField(null=True, blank=True)
    django_response = models.JSONField(null=True, blank=True)
    playnest_response = models.JSONField(null=True, blank=True)
    django_status_code = models.IntegerField()
    playnest_status_code = models.IntegerField(null=True, blank=True)
    diff_result = models.JSONField(null=True, blank=True)
    match_status = models.CharField(
        max_length=20,
        choices=[
            ('MATCH', 'Match'),
            ('MISMATCH', 'Mismatch'),
            ('ERROR', 'Error'),
        ],
        default='MATCH'
    )
    mismatch_severity = models.CharField(
        max_length=20,
        choices=[
            ('NONE', 'None'),
            ('INFO', 'Info'),
            ('WARNING', 'Warning'),
            ('CRITICAL', 'Critical'),
        ],
        default='NONE'
    )
    django_latency_ms = models.FloatField()
    playnest_latency_ms = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.method} {self.path} - {self.match_status}"
