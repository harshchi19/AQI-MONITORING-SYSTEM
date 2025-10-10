from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_analytics, name='dashboard_analytics'),
    path('trends/', views.trend_analysis, name='trend_analysis'),
    path('reports/', views.generate_report, name='generate_report'),
    path('comparisons/', views.location_comparison, name='location_comparison'),
    path('forecasts/', views.aqi_forecast, name='aqi_forecast'),
]