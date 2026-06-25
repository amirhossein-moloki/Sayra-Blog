import json
import threading
import time

import requests
from django.conf import settings

from core.models import ShadowLog
from core.utils.shadow_diff import compare_responses


class ShadowProxyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.playnest_url = getattr(
            settings, "PLAYNEST_URL", "http://localhost:3000/api/v1"
        )
        self.enabled = getattr(settings, "SHADOW_MODE_ENABLED", False)

    def __call__(self, request):
        # Capture start time and request payload
        start_time = time.time()

        # We only care about /api/ requests for CMS related modules
        is_cms_request = request.path.startswith("/api/") and any(
            module in request.path
            for module in [
                "posts",
                "categories",
                "tags",
                "comments",
                "reactions",
                "pages",
                "navigation",
            ]
        )

        # Get Django response
        response = self.get_response(request)

        if not self.enabled or not is_cms_request:
            return response

        django_latency = (time.time() - start_time) * 1000

        # Clone request and send to PlayNest asynchronously
        # Using a thread for simplicity as per plan, but in prod Celery would be better.
        threading.Thread(
            target=self.shadow_request, args=(request, response, django_latency)
        ).start()

        return response

    def shadow_request(self, request, django_response, django_latency):
        try:
            # Map Django path to PlayNest path if necessary
            # For now assume direct mapping or minor adjustments
            playnest_path = request.path.replace("/api/", "/")
            url = f"{self.playnest_url.rstrip('/')}{playnest_path}"

            headers = {
                "Content-Type": "application/json",
                "X-API-Key": settings.STATIC_API_KEY,
                # In shadow mode we might want to pass some context
                "X-Shadow-Mode": "true",
            }

            # Forward relevant headers from original request if needed (e.g. Auth)
            if "HTTP_AUTHORIZATION" in request.META:
                headers["Authorization"] = request.META["HTTP_AUTHORIZATION"]

            method = request.method
            body = None
            if method in ["POST", "PUT", "PATCH"]:
                try:
                    body = json.loads(request.body)
                except Exception:
                    body = None

            start_time = time.time()
            try:
                pn_res = requests.request(
                    method=method, url=url, headers=headers, json=body, timeout=5
                )
                playnest_latency = (time.time() - start_time) * 1000
                playnest_status_code = pn_res.status_code
                try:
                    playnest_data = pn_res.json()
                except Exception:
                    playnest_data = {"raw_response": pn_res.text}
            except Exception as e:
                playnest_latency = (time.time() - start_time) * 1000
                playnest_status_code = 0
                playnest_data = {"error": str(e)}

            # Compare responses
            django_data = {}
            if django_response.get("Content-Type") == "application/json":
                try:
                    django_data = json.loads(django_response.content)
                except Exception:
                    django_data = {"raw_response": django_response.content.decode()}

            status, severity, diff = compare_responses(django_data, playnest_data)

            # Log to DB
            ShadowLog.objects.create(
                method=method,
                path=request.path,
                request_payload=body,
                django_response=django_data,
                playnest_response=playnest_data,
                django_status_code=django_response.status_code,
                playnest_status_code=playnest_status_code,
                diff_result=diff,
                match_status=status,
                mismatch_severity=severity,
                django_latency_ms=django_latency,
                playnest_latency_ms=playnest_latency,
            )

        except Exception as e:
            # We must not crash the main thread, but here we are in a sub-thread
            print(f"Error in shadow request: {e}")
