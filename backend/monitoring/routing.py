from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/aqi/(?P<location_id>\w+)/$', consumers.AQIConsumer.as_asgi()),
    re_path(r'ws/aqi/$', consumers.AQIConsumer.as_asgi()),
    re_path(r'ws/alerts/(?P<location_id>\w+)/$', consumers.AlertConsumer.as_asgi()),
    re_path(r'ws/alerts/$', consumers.AlertConsumer.as_asgi()),
    re_path(r'ws/dashboard/$', consumers.DashboardConsumer.as_asgi()),
]