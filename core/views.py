from django.shortcuts import render
from django.db.models import Count, Avg, F, ExpressionWrapper, FloatField
from core.models import ShadowLog

def shadow_dashboard(request):
    logs = ShadowLog.objects.all().order_by('-timestamp')[:100]

    total_requests = ShadowLog.objects.count()
    match_count = ShadowLog.objects.filter(match_status='MATCH').count()
    mismatch_count = ShadowLog.objects.filter(match_status='MISMATCH').count()
    error_count = ShadowLog.objects.filter(match_status='ERROR').count()

    match_rate = (match_count / total_requests * 100) if total_requests > 0 else 0

    avg_django_latency = ShadowLog.objects.aggregate(Avg('django_latency_ms'))['django_latency_ms__avg'] or 0
    avg_playnest_latency = ShadowLog.objects.aggregate(Avg('playnest_latency_ms'))['playnest_latency_ms__avg'] or 0

    severity_breakdown = ShadowLog.objects.values('mismatch_severity').annotate(count=Count('id'))

    endpoint_breakdown_raw = ShadowLog.objects.values('path').annotate(
        count=Count('id'),
        matches=Count('id', filter=F(match_status='MATCH')),
        avg_django=Avg('django_latency_ms'),
        avg_playnest=Avg('playnest_latency_ms')
    )

    endpoint_breakdown = []
    for ep in endpoint_breakdown_raw:
        ep['match_pct'] = (ep['matches'] / ep['count'] * 100) if ep['count'] > 0 else 0
        endpoint_breakdown.append(ep)

    context = {
        'logs': logs,
        'total_requests': total_requests,
        'match_rate': match_rate,
        'mismatch_count': mismatch_count,
        'error_count': error_count,
        'avg_django_latency': avg_django_latency,
        'avg_playnest_latency': avg_playnest_latency,
        'severity_breakdown': severity_breakdown,
        'endpoint_breakdown': endpoint_breakdown,
    }
    return render(request, 'shadow_dashboard.html', context)
