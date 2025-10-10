from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class Location(models.Model):
    """Model to store location information"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.city}"

class Sensor(models.Model):
    """Model to store sensor information"""
    SENSOR_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('ERROR', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sensor_id = models.CharField(max_length=20, unique=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='sensors')
    status = models.CharField(max_length=20, choices=SENSOR_STATUS_CHOICES, default='ACTIVE')
    last_maintenance = models.DateTimeField(null=True, blank=True)
    installed_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['sensor_id']
    
    def __str__(self):
        return f"{self.sensor_id} - {self.location.name}"

class SensorReading(models.Model):
    """Model to store raw sensor readings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Pollutant measurements
    pm25 = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)],
        help_text="PM2.5 concentration (µg/m³)"
    )
    pm10 = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)],
        help_text="PM10 concentration (µg/m³)"
    )
    co = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)],
        help_text="Carbon Monoxide concentration (ppm)"
    )
    no2 = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)],
        help_text="Nitrogen Dioxide concentration (ppb)"
    )
    so2 = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1000.0)],
        help_text="Sulfur Dioxide concentration (ppb)"
    )
    o3 = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(500.0)],
        help_text="Ozone concentration (ppb)"
    )
    
    # Metadata
    temperature = models.FloatField(null=True, blank=True, help_text="Temperature (°C)")
    humidity = models.FloatField(null=True, blank=True, help_text="Humidity (%)")
    wind_speed = models.FloatField(null=True, blank=True, help_text="Wind Speed (m/s)")
    wind_direction = models.FloatField(null=True, blank=True, help_text="Wind Direction (degrees)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['sensor', '-timestamp']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.sensor.sensor_id} - {self.timestamp}"

class AQICalculation(models.Model):
    """Model to store calculated AQI values"""
    AQI_STATUS_CHOICES = [
        ('GOOD', 'Good'),
        ('MODERATE', 'Moderate'),
        ('UNHEALTHY_SG', 'Unhealthy for Sensitive Groups'),
        ('UNHEALTHY', 'Unhealthy'),
        ('VERY_UNHEALTHY', 'Very Unhealthy'),
        ('HAZARDOUS', 'Hazardous'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sensor_reading = models.OneToOneField(SensorReading, on_delete=models.CASCADE, related_name='aqi_calculation')
    
    # Individual AQI components
    aqi_pm25 = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_pm10 = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_co = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_no2 = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_so2 = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_o3 = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    
    # Overall AQI (highest component)
    overall_aqi = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(500.0)])
    aqi_status = models.CharField(max_length=20, choices=AQI_STATUS_CHOICES)
    dominant_pollutant = models.CharField(max_length=10)  # PM25, PM10, CO, NO2, SO2, O3
    
    calculated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-calculated_at']
        indexes = [
            models.Index(fields=['-calculated_at']),
            models.Index(fields=['aqi_status']),
            models.Index(fields=['overall_aqi']),
        ]
    
    def __str__(self):
        return f"{self.sensor_reading.sensor.sensor_id} - AQI: {self.overall_aqi:.1f} ({self.aqi_status})"

class Alert(models.Model):
    """Model to store air quality alerts"""
    ALERT_SEVERITY_CHOICES = [
        ('INFO', 'Information'),
        ('WARNING', 'Warning'),
        ('CRITICAL', 'Critical'),
        ('EMERGENCY', 'Emergency'),
    ]
    
    ALERT_TYPE_CHOICES = [
        ('AQI_THRESHOLD', 'AQI Threshold Exceeded'),
        ('POLLUTANT_SPIKE', 'Pollutant Spike'),
        ('SENSOR_OFFLINE', 'Sensor Offline'),
        ('DATA_ANOMALY', 'Data Anomaly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='alerts')
    aqi_calculation = models.ForeignKey(AQICalculation, on_delete=models.CASCADE, null=True, blank=True, related_name='alerts')
    
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=ALERT_SEVERITY_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Alert specific data
    threshold_value = models.FloatField(null=True, blank=True)
    actual_value = models.FloatField(null=True, blank=True)
    pollutant = models.CharField(max_length=10, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    acknowledged = models.BooleanField(default=False)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sensor', '-created_at']),
            models.Index(fields=['severity', 'is_active']),
            models.Index(fields=['alert_type']),
        ]
    
    def __str__(self):
        return f"{self.sensor.sensor_id} - {self.title} ({self.severity})"

class UserPreference(models.Model):
    """Model to store user preferences for alerts and thresholds"""
    NOTIFICATION_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
        ('NONE', 'No Notifications'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='user_preferences')
    
    # Alert thresholds (override defaults)
    custom_aqi_threshold = models.FloatField(null=True, blank=True)
    custom_pm25_threshold = models.FloatField(null=True, blank=True)
    custom_pm10_threshold = models.FloatField(null=True, blank=True)
    
    # Notification preferences
    notification_method = models.CharField(max_length=10, choices=NOTIFICATION_CHOICES, default='NONE')
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    
    # Update frequency
    update_frequency_minutes = models.IntegerField(default=5, validators=[MinValueValidator(1), MaxValueValidator(60)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences for {self.location.name}"