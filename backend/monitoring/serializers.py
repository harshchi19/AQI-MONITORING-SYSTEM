from rest_framework import serializers
from .models import Location, Sensor, SensorReading, AQICalculation, Alert, UserPreference

class LocationSerializer(serializers.ModelSerializer):
    sensor_count = serializers.SerializerMethodField()
    latest_aqi = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'state', 'latitude', 'longitude', 
                 'created_at', 'sensor_count', 'latest_aqi']
    
    def get_sensor_count(self, obj):
        return obj.sensors.filter(status='ACTIVE').count()
    
    def get_latest_aqi(self, obj):
        latest_sensor = obj.sensors.filter(status='ACTIVE').first()
        if latest_sensor:
            latest_reading = latest_sensor.readings.first()
            if latest_reading and hasattr(latest_reading, 'aqi_calculation'):
                return {
                    'aqi': latest_reading.aqi_calculation.overall_aqi,
                    'status': latest_reading.aqi_calculation.aqi_status,
                    'timestamp': latest_reading.timestamp
                }
        return None

class SensorSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    latest_reading_time = serializers.SerializerMethodField()
    current_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Sensor
        fields = ['id', 'sensor_id', 'location', 'location_name', 'status', 
                 'last_maintenance', 'installed_date', 'latest_reading_time', 'current_status']
    
    def get_latest_reading_time(self, obj):
        latest = obj.readings.first()
        return latest.timestamp if latest else None
    
    def get_current_status(self, obj):
        latest = obj.readings.first()
        if latest and hasattr(latest, 'aqi_calculation'):
            return {
                'aqi': latest.aqi_calculation.overall_aqi,
                'status': latest.aqi_calculation.aqi_status,
                'dominant_pollutant': latest.aqi_calculation.dominant_pollutant
            }
        return None

class SensorReadingSerializer(serializers.ModelSerializer):
    sensor_id = serializers.CharField(source='sensor.sensor_id', read_only=True)
    location_name = serializers.CharField(source='sensor.location.name', read_only=True)
    
    class Meta:
        model = SensorReading
        fields = ['id', 'sensor', 'sensor_id', 'location_name', 'timestamp', 
                 'pm25', 'pm10', 'co', 'no2', 'so2', 'o3', 
                 'temperature', 'humidity', 'wind_speed', 'wind_direction']

class AQICalculationSerializer(serializers.ModelSerializer):
    sensor_id = serializers.CharField(source='sensor_reading.sensor.sensor_id', read_only=True)
    location_name = serializers.CharField(source='sensor_reading.sensor.location.name', read_only=True)
    timestamp = serializers.DateTimeField(source='sensor_reading.timestamp', read_only=True)
    pollutant_data = serializers.SerializerMethodField()
    
    class Meta:
        model = AQICalculation
        fields = ['id', 'sensor_id', 'location_name', 'timestamp', 
                 'aqi_pm25', 'aqi_pm10', 'aqi_co', 'aqi_no2', 'aqi_so2', 'aqi_o3',
                 'overall_aqi', 'aqi_status', 'dominant_pollutant', 'calculated_at',
                 'pollutant_data']
    
    def get_pollutant_data(self, obj):
        return {
            'pm25': obj.sensor_reading.pm25,
            'pm10': obj.sensor_reading.pm10,
            'co': obj.sensor_reading.co,
            'no2': obj.sensor_reading.no2,
            'so2': obj.sensor_reading.so2,
            'o3': obj.sensor_reading.o3,
        }

class AlertSerializer(serializers.ModelSerializer):
    sensor_id = serializers.CharField(source='sensor.sensor_id', read_only=True)
    location_name = serializers.CharField(source='sensor.location.name', read_only=True)
    aqi_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Alert
        fields = ['id', 'sensor_id', 'location_name', 'alert_type', 'severity', 
                 'title', 'message', 'threshold_value', 'actual_value', 'pollutant',
                 'is_active', 'acknowledged', 'acknowledged_at', 'created_at', 'aqi_value']
    
    def get_aqi_value(self, obj):
        if obj.aqi_calculation:
            return obj.aqi_calculation.overall_aqi
        return None

class UserPreferenceSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    
    class Meta:
        model = UserPreference
        fields = ['id', 'location', 'location_name', 'custom_aqi_threshold', 
                 'custom_pm25_threshold', 'custom_pm10_threshold', 
                 'notification_method', 'email', 'phone', 'update_frequency_minutes']

# Specialized serializers for dashboard
class DashboardLocationSerializer(serializers.ModelSerializer):
    """Optimized serializer for dashboard location cards"""
    current_aqi = serializers.SerializerMethodField()
    alert_count = serializers.SerializerMethodField()
    sensor_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'current_aqi', 'alert_count', 'sensor_status']
    
    def get_current_aqi(self, obj):
        # Get the most recent AQI calculation for this location
        latest_calc = AQICalculation.objects.filter(
            sensor_reading__sensor__location=obj,
            sensor_reading__sensor__status='ACTIVE'
        ).select_related('sensor_reading__sensor').first()
        
        if latest_calc:
            return {
                'aqi': latest_calc.overall_aqi,
                'status': latest_calc.aqi_status,
                'dominant_pollutant': latest_calc.dominant_pollutant,
                'timestamp': latest_calc.sensor_reading.timestamp,
                'sensor_id': latest_calc.sensor_reading.sensor.sensor_id
            }
        return None
    
    def get_alert_count(self, obj):
        return Alert.objects.filter(
            sensor__location=obj,
            is_active=True,
            acknowledged=False
        ).count()
    
    def get_sensor_status(self, obj):
        sensors = obj.sensors.all()
        return {
            'total': sensors.count(),
            'active': sensors.filter(status='ACTIVE').count(),
            'offline': sensors.filter(status='INACTIVE').count(),
            'maintenance': sensors.filter(status='MAINTENANCE').count()
        }

class TimeSeriesDataSerializer(serializers.Serializer):
    """Serializer for time series chart data"""
    timestamp = serializers.DateTimeField()
    aqi = serializers.FloatField()
    pm25 = serializers.FloatField()
    pm10 = serializers.FloatField()
    co = serializers.FloatField()
    no2 = serializers.FloatField()
    so2 = serializers.FloatField()
    o3 = serializers.FloatField()
    location = serializers.CharField()
    sensor_id = serializers.CharField()

class SensorReadingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new sensor readings via API"""
    sensor_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = SensorReading
        fields = ['sensor_id', 'timestamp', 'pm25', 'pm10', 'co', 'no2', 'so2', 'o3',
                 'temperature', 'humidity', 'wind_speed', 'wind_direction']
    
    def create(self, validated_data):
        sensor_id = validated_data.pop('sensor_id')
        try:
            sensor = Sensor.objects.get(sensor_id=sensor_id)
            validated_data['sensor'] = sensor
            return super().create(validated_data)
        except Sensor.DoesNotExist:
            raise serializers.ValidationError(f"Sensor with ID {sensor_id} does not exist")

class AnalyticsSerializer(serializers.Serializer):
    """Serializer for analytics data"""
    period = serializers.CharField()
    location = serializers.CharField()
    avg_aqi = serializers.FloatField()
    max_aqi = serializers.FloatField()
    min_aqi = serializers.FloatField()
    alert_count = serializers.IntegerField()
    dominant_pollutants = serializers.DictField()
    aqi_distribution = serializers.DictField()