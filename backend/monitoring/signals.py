from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import SensorReading, AQICalculation, Alert, Sensor
from .utils import calculate_aqi_from_sensor_reading
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=SensorReading)
def calculate_aqi_on_new_reading(sender, instance, created, **kwargs):
    """
    Automatically calculate AQI when a new sensor reading is created
    """
    if created:
        try:
            # Calculate AQI
            aqi_data = calculate_aqi_from_sensor_reading(instance)
            
            # Create AQI calculation record
            aqi_calc = AQICalculation.objects.create(
                sensor_reading=instance,
                aqi_pm25=aqi_data['aqi_components']['PM25'],
                aqi_pm10=aqi_data['aqi_components']['PM10'],
                aqi_co=aqi_data['aqi_components']['CO'],
                aqi_no2=aqi_data['aqi_components']['NO2'],
                aqi_so2=aqi_data['aqi_components']['SO2'],
                aqi_o3=aqi_data['aqi_components']['O3'],
                overall_aqi=aqi_data['overall_aqi'],
                aqi_status=aqi_data['aqi_status'],
                dominant_pollutant=aqi_data['dominant_pollutant']
            )
            
            # Generate alerts if necessary
            if aqi_data['alerts']['has_alert']:
                create_aqi_alert(instance.sensor, aqi_calc, aqi_data['alerts'])
            
            logger.info(f"AQI calculated for sensor {instance.sensor.sensor_id}: {aqi_data['overall_aqi']}")
            
        except Exception as e:
            logger.error(f"Error calculating AQI for sensor reading {instance.id}: {e}")

def create_aqi_alert(sensor, aqi_calculation, alert_data):
    """
    Create an alert based on AQI calculation
    """
    try:
        # Check if there's already an active alert for this sensor
        existing_alert = Alert.objects.filter(
            sensor=sensor,
            alert_type='AQI_THRESHOLD',
            is_active=True
        ).first()
        
        if existing_alert:
            # Update existing alert with new information
            existing_alert.message = " ".join(alert_data['messages'])
            existing_alert.severity = alert_data['severity']
            existing_alert.actual_value = aqi_calculation.overall_aqi
            existing_alert.updated_at = timezone.now()
            existing_alert.save()
        else:
            # Create new alert
            Alert.objects.create(
                sensor=sensor,
                aqi_calculation=aqi_calculation,
                alert_type='AQI_THRESHOLD',
                severity=alert_data['severity'],
                title=f"Air Quality Alert - {sensor.location.name}",
                message=" ".join(alert_data['messages']),
                threshold_value=100.0,  # Standard threshold for alerts
                actual_value=aqi_calculation.overall_aqi,
                pollutant=aqi_calculation.dominant_pollutant
            )
        
        logger.info(f"Alert created/updated for sensor {sensor.sensor_id}")
        
    except Exception as e:
        logger.error(f"Error creating alert for sensor {sensor.sensor_id}: {e}")

@receiver(post_save, sender=SensorReading)
def check_sensor_status(sender, instance, created, **kwargs):
    """
    Update sensor status based on recent readings
    """
    if created:
        sensor = instance.sensor
        
        # Update sensor status to ACTIVE if it was offline
        if sensor.status != 'ACTIVE':
            sensor.status = 'ACTIVE'
            sensor.save()
            
            # Clear any sensor offline alerts
            Alert.objects.filter(
                sensor=sensor,
                alert_type='SENSOR_OFFLINE',
                is_active=True
            ).update(is_active=False)