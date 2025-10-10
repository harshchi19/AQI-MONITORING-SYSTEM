from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from monitoring.models import Sensor, SensorReading
from monitoring.serializers import SensorReadingCreateSerializer
import json

@api_view(['GET'])
def sensor_health_check(request):
    """Check health status of all sensors"""
    sensors = Sensor.objects.all()
    health_data = []
    
    for sensor in sensors:
        latest_reading = sensor.readings.first()
        
        if latest_reading:
            time_diff = timezone.now() - latest_reading.timestamp
            is_online = time_diff.total_seconds() < 300  # 5 minutes
            
            health_data.append({
                'sensor_id': sensor.sensor_id,
                'location': sensor.location.name,
                'status': sensor.status,
                'is_online': is_online,
                'last_reading': latest_reading.timestamp,
                'readings_today': sensor.readings.filter(
                    timestamp__date=timezone.now().date()
                ).count()
            })
        else:
            health_data.append({
                'sensor_id': sensor.sensor_id,
                'location': sensor.location.name,
                'status': sensor.status,
                'is_online': False,
                'last_reading': None,
                'readings_today': 0
            })
    
    return Response({
        'timestamp': timezone.now(),
        'total_sensors': len(sensors),
        'online_sensors': sum(1 for s in health_data if s['is_online']),
        'sensors': health_data
    })

@api_view(['POST'])
def batch_sensor_data_upload(request):
    """Upload multiple sensor readings at once"""
    try:
        readings_data = request.data.get('readings', [])
        
        if not readings_data:
            return Response(
                {'error': 'No readings data provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_readings = []
        errors = []
        
        for reading_data in readings_data:
            serializer = SensorReadingCreateSerializer(data=reading_data)
            if serializer.is_valid():
                reading = serializer.save()
                created_readings.append(reading.id)
            else:
                errors.append({
                    'data': reading_data,
                    'errors': serializer.errors
                })
        
        return Response({
            'message': f'Successfully created {len(created_readings)} readings',
            'created_readings': created_readings,
            'errors': errors,
            'timestamp': timezone.now()
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def sensor_calibration(request):
    """Handle sensor calibration data"""
    sensor_id = request.data.get('sensor_id')
    calibration_data = request.data.get('calibration_data', {})
    
    try:
        sensor = Sensor.objects.get(sensor_id=sensor_id)
        
        # Log calibration event (you can extend this to store calibration history)
        # For now, just update sensor status
        sensor.last_maintenance = timezone.now()
        sensor.save()
        
        return Response({
            'message': f'Calibration data received for sensor {sensor_id}',
            'sensor': sensor.sensor_id,
            'location': sensor.location.name,
            'timestamp': timezone.now()
        })
        
    except Sensor.DoesNotExist:
        return Response(
            {'error': f'Sensor {sensor_id} not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )