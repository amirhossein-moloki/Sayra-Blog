import json
import time
from django.test import TransactionTestCase, RequestFactory
from django.http import JsonResponse
from django.conf import settings
from core.models import ShadowLog
from core.middleware.shadow_proxy import ShadowProxyMiddleware
from unittest.mock import patch, MagicMock

class ShadowSystemTest(TransactionTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.get_response = MagicMock(return_value=JsonResponse({'data': 'test'}, status=200))
        self.middleware = ShadowProxyMiddleware(self.get_response)

        # Ensure shadow mode is enabled for tests
        settings.SHADOW_MODE_ENABLED = True
        settings.PLAYNEST_URL = 'http://mock-playnest/api/v1'
        settings.STATIC_API_KEY = 'test-api-key'
        ShadowLog.objects.all().delete()

    @patch('requests.request')
    def test_shadow_request_logging(self, mock_request):
        # Mock PlayNest response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': 'test'}
        mock_request.return_value = mock_response

        # Simulate a CMS request
        request = self.factory.get('/api/posts/')
        self.middleware(request)

        # Poll for the log entry since it is created in a separate thread
        max_retries = 10
        while ShadowLog.objects.count() == 0 and max_retries > 0:
            time.sleep(0.1)
            max_retries -= 1

        # Verify ShadowLog was created
        self.assertEqual(ShadowLog.objects.count(), 1)
        log = ShadowLog.objects.first()
        self.assertEqual(log.path, '/api/posts/')
        self.assertEqual(log.match_status, 'MATCH')
        self.assertEqual(log.mismatch_severity, 'NONE')

        # Verify PlayNest was called with correct parameters
        mock_request.assert_called_once()
        args, kwargs = mock_request.call_args
        self.assertEqual(kwargs['method'], 'GET')
        self.assertEqual(kwargs['url'], 'http://mock-playnest/api/v1/posts/')
        self.assertEqual(kwargs['headers']['X-Shadow-Mode'], 'true')

    @patch('requests.request')
    def test_shadow_mismatch_detection(self, mock_request):
        # Mock PlayNest response with different data
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'data': 'mismatch'}
        mock_request.return_value = mock_response

        # Simulate a CMS request
        request = self.factory.get('/api/posts/')
        self.middleware(request)

        max_retries = 10
        while ShadowLog.objects.count() == 0 and max_retries > 0:
            time.sleep(0.1)
            max_retries -= 1

        # Verify ShadowLog recorded the mismatch
        log = ShadowLog.objects.first()
        self.assertIsNotNone(log)
        self.assertEqual(log.match_status, 'MISMATCH')
        self.assertEqual(log.mismatch_severity, 'CRITICAL')
        self.assertIn('data', log.diff_result)

    def test_non_cms_request_not_shadowed(self):
        # Simulate a non-CMS request
        request = self.factory.get('/api/users/')
        self.middleware(request)

        time.sleep(0.2)
        self.assertEqual(ShadowLog.objects.count(), 0)
