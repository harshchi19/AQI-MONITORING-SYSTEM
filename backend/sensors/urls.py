from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.sensor_health_check, name='sensor_health'),
    path('batch-upload/', views.batch_sensor_data_upload, name='batch_upload'),
    path('calibration/', views.sensor_calibration, name='sensor_calibration'),
]