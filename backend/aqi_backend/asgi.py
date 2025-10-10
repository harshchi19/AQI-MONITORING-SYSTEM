"""
ASGI config for aqi_backend project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import monitoring.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aqi_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            monitoring.routing.websocket_urlpatterns
        )
    ),
})