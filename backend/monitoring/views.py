from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Avg, Max, Min, Count, Q
from datetime import timedelta
import logging

from .models import Location, Sensor, SensorReading, AQICalculation, Alert, UserPreference
from .serializers import (
    LocationSerializer, SensorSerializer, SensorReadingSerializer, 
    AQICalculationSerializer, AlertSerializer, UserPreferenceSerializer,
    DashboardLocationSerializer, TimeSeriesDataSerializer, SensorReadingCreateSerializer
)

logger = logging.getLogger(__name__)

class LocationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing locations"""
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = [filters.SearchFilter]
    # filterset_fields = ['city', 'state']
    search_fields = ['name', 'city', 'state']
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get locations with current AQI data for dashboard"""
        locations = Location.objects.prefetch_related('sensors__readings__aqi_calculation').all()
        serializer = DashboardLocationSerializer(locations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def current_status(self, request, pk=None):
        """Get current air quality status for a specific location"""
        location = self.get_object()
        
        # Get latest AQI calculation for this location
        latest_calc = AQICalculation.objects.filter(
            sensor_reading__sensor__location=location,
            sensor_reading__sensor__status='ACTIVE'
        ).select_related('sensor_reading__sensor').first()
        
        if not latest_calc:
            return Response({'error': 'No recent data available'}, status=404)
        
        return Response({
            'location': LocationSerializer(location).data,
            'current_aqi': AQICalculationSerializer(latest_calc).data,
            'sensors': SensorSerializer(location.sensors.filter(status='ACTIVE'), many=True).data
        })

class SensorViewSet(viewsets.ModelViewSet):
    """ViewSet for managing sensors"""
    queryset = Sensor.objects.select_related('location').all()
    serializer_class = SensorSerializer
    filter_backends = [filters.SearchFilter]
    filterset_fields = ['status', 'location', 'location__city']
    search_fields = ['sensor_id', 'location__name']
    
    @action(detail=True, methods=['get'])
    def readings(self, request, pk=None):
        """Get recent readings for a specific sensor"""
        sensor = self.get_object()
        hours = int(request.query_params.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        
        readings = SensorReading.objects.filter(
            sensor=sensor,
            timestamp__gte=since
        ).select_related('aqi_calculation').order_by('-timestamp')
        
        serializer = SensorReadingSerializer(readings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def maintenance(self, request, pk=None):
        """Mark sensor for maintenance"""
        sensor = self.get_object()
        sensor.status = 'MAINTENANCE'
        sensor.last_maintenance = timezone.now()
        sensor.save()
        
        return Response({'message': 'Sensor marked for maintenance'})

class SensorReadingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing sensor readings"""
    queryset = SensorReading.objects.select_related('sensor', 'sensor__location').all()
    serializer_class = SensorReadingSerializer
    filter_backends = []
    filterset_fields = ['sensor', 'sensor__location']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SensorReadingCreateSerializer
        return SensorReadingSerializer
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest readings from all active sensors"""
        latest_readings = []
        sensors = Sensor.objects.filter(status='ACTIVE')
        
        for sensor in sensors:
            latest = sensor.readings.select_related('aqi_calculation').first()
            if latest:
                latest_readings.append(latest)
        
        serializer = SensorReadingSerializer(latest_readings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def time_series(self, request):
        """Get time series data for charts"""
        hours = int(request.query_params.get('hours', 24))
        location_id = request.query_params.get('location')
        sensor_id = request.query_params.get('sensor')
        
        since = timezone.now() - timedelta(hours=hours)
        queryset = SensorReading.objects.filter(timestamp__gte=since)
        
        if location_id:
            queryset = queryset.filter(sensor__location_id=location_id)
        if sensor_id:
            queryset = queryset.filter(sensor__sensor_id=sensor_id)
        
        readings = queryset.select_related(
            'sensor', 'sensor__location', 'aqi_calculation'
        ).order_by('timestamp')
        
        data = []
        for reading in readings:
            if hasattr(reading, 'aqi_calculation'):
                data.append({
                    'timestamp': reading.timestamp,
                    'aqi': reading.aqi_calculation.overall_aqi,
                    'pm25': reading.pm25,
                    'pm10': reading.pm10,
                    'co': reading.co,
                    'no2': reading.no2,
                    'so2': reading.so2,
                    'o3': reading.o3,
                    'location': reading.sensor.location.name,
                    'sensor_id': reading.sensor.sensor_id,
                })
        
        return Response(data)

class AQICalculationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AQI calculations (read-only)"""
    queryset = AQICalculation.objects.select_related(
        'sensor_reading__sensor__location'
    ).all()
    serializer_class = AQICalculationSerializer
    filter_backends = []
    filterset_fields = ['aqi_status', 'dominant_pollutant', 'sensor_reading__sensor__location']
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current AQI for all locations"""
        current_aqi = []
        locations = Location.objects.all()
        
        for location in locations:
            latest_calc = AQICalculation.objects.filter(
                sensor_reading__sensor__location=location,
                sensor_reading__sensor__status='ACTIVE'
            ).first()
            
            if latest_calc:
                current_aqi.append(latest_calc)
        
        serializer = AQICalculationSerializer(current_aqi, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get AQI analytics data"""
        days = int(request.query_params.get('days', 7))
        location_id = request.query_params.get('location')
        
        since = timezone.now() - timedelta(days=days)
        queryset = AQICalculation.objects.filter(calculated_at__gte=since)
        
        if location_id:
            queryset = queryset.filter(sensor_reading__sensor__location_id=location_id)
        
        # Overall statistics
        stats = queryset.aggregate(
            avg_aqi=Avg('overall_aqi'),
            max_aqi=Max('overall_aqi'),
            min_aqi=Min('overall_aqi'),
            total_readings=Count('id')
        )
        
        # AQI status distribution
        status_distribution = queryset.values('aqi_status').annotate(
            count=Count('id')
        ).order_by('aqi_status')
        
        # Dominant pollutant distribution
        pollutant_distribution = queryset.values('dominant_pollutant').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Hourly averages
        hourly_data = []
        for hour in range(24):
            hour_avg = queryset.filter(
                calculated_at__hour=hour
            ).aggregate(avg_aqi=Avg('overall_aqi'))
            
            hourly_data.append({
                'hour': hour,
                'avg_aqi': hour_avg['avg_aqi'] or 0
            })
        
        return Response({
            'period': f"{days} days",
            'statistics': stats,
            'status_distribution': list(status_distribution),
            'pollutant_distribution': list(pollutant_distribution),
            'hourly_averages': hourly_data
        })

class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet for managing alerts"""
    queryset = Alert.objects.select_related('sensor__location').all()
    serializer_class = AlertSerializer
    filter_backends = []
    filterset_fields = ['alert_type', 'severity', 'is_active', 'acknowledged']
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active, unacknowledged alerts"""
        alerts = Alert.objects.filter(
            is_active=True,
            acknowledged=False
        ).select_related('sensor__location').order_by('-created_at')
        
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        alert.acknowledged = True
        alert.acknowledged_at = timezone.now()
        alert.save()
        
        return Response({'message': 'Alert acknowledged'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an alert"""
        alert = self.get_object()
        alert.is_active = False
        alert.save()
        
        return Response({'message': 'Alert deactivated'})
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get alert summary statistics"""
        active_alerts = Alert.objects.filter(is_active=True)
        
        summary = {
            'total_active': active_alerts.count(),
            'unacknowledged': active_alerts.filter(acknowledged=False).count(),
            'by_severity': dict(active_alerts.values_list('severity').annotate(count=Count('id'))),
            'by_type': dict(active_alerts.values_list('alert_type').annotate(count=Count('id'))),
            'recent': AlertSerializer(
                active_alerts.order_by('-created_at')[:5], many=True
            ).data
        }
        
        return Response(summary)

class UserPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user preferences"""
    queryset = UserPreference.objects.select_related('location').all()
    serializer_class = UserPreferenceSerializer
    filter_backends = []
    filterset_fields = ['location', 'notification_method']