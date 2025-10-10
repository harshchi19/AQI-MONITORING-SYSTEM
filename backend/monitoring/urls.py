from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, SensorViewSet, SensorReadingViewSet,
    AQICalculationViewSet, AlertViewSet, UserPreferenceViewSet
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'readings', SensorReadingViewSet)
router.register(r'aqi', AQICalculationViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'preferences', UserPreferenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]