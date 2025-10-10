from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Location, Sensor, SensorReading, AQICalculation, Alert, UserPreference

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'state', 'sensor_count', 'created_at']
    list_filter = ['city', 'state', 'created_at']
    search_fields = ['name', 'city', 'state']
    readonly_fields = ['id', 'created_at']
    
    def sensor_count(self, obj):
        return obj.sensors.count()
    sensor_count.short_description = 'Sensors'

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ['sensor_id', 'location', 'status', 'latest_reading', 'installed_date']
    list_filter = ['status', 'location__city', 'installed_date']
    search_fields = ['sensor_id', 'location__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    def latest_reading(self, obj):
        latest = obj.readings.first()
        if latest:
            return latest.timestamp.strftime('%Y-%m-%d %H:%M')
        return 'No readings'
    latest_reading.short_description = 'Latest Reading'

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ['sensor', 'timestamp', 'pm25_display', 'pm10_display', 'aqi_status', 'view_aqi']
    list_filter = ['sensor__location', 'timestamp', 'sensor__sensor_id']
    search_fields = ['sensor__sensor_id', 'sensor__location__name']
    readonly_fields = ['id', 'created_at']
    date_hierarchy = 'timestamp'
    
    def pm25_display(self, obj):
        color = 'red' if obj.pm25 > 55.4 else 'orange' if obj.pm25 > 35.4 else 'green'
        return format_html('<span style="color: {};">{:.2f} µg/m³</span>', color, obj.pm25)
    pm25_display.short_description = 'PM2.5'
    
    def pm10_display(self, obj):
        color = 'red' if obj.pm10 > 154 else 'orange' if obj.pm10 > 54 else 'green'
        return format_html('<span style="color: {};">{:.2f} µg/m³</span>', color, obj.pm10)
    pm10_display.short_description = 'PM10'
    
    def aqi_status(self, obj):
        try:
            aqi_calc = obj.aqi_calculation
            color_map = {
                'GOOD': 'green',
                'MODERATE': 'yellow',
                'UNHEALTHY_SG': 'orange',
                'UNHEALTHY': 'red',
                'VERY_UNHEALTHY': 'purple',
                'HAZARDOUS': 'maroon'
            }
            color = color_map.get(aqi_calc.aqi_status, 'black')
            return format_html(
                '<span style="color: {}; font-weight: bold;">{} ({:.1f})</span>', 
                color, 
                aqi_calc.aqi_status.replace('_', ' '),
                aqi_calc.overall_aqi
            )
        except:
            return 'Not calculated'
    aqi_status.short_description = 'AQI Status'
    
    def view_aqi(self, obj):
        try:
            aqi_calc = obj.aqi_calculation
            url = reverse('admin:monitoring_aqicalculation_change', args=[aqi_calc.id])
            return format_html('<a href="{}">View AQI</a>', url)
        except:
            return 'N/A'
    view_aqi.short_description = 'AQI Details'

@admin.register(AQICalculation)
class AQICalculationAdmin(admin.ModelAdmin):
    list_display = ['sensor_name', 'overall_aqi_display', 'aqi_status_display', 'dominant_pollutant', 'calculated_at']
    list_filter = ['aqi_status', 'dominant_pollutant', 'calculated_at']
    search_fields = ['sensor_reading__sensor__sensor_id', 'sensor_reading__sensor__location__name']
    readonly_fields = ['id', 'calculated_at', 'aqi_breakdown']
    date_hierarchy = 'calculated_at'
    
    def sensor_name(self, obj):
        return f"{obj.sensor_reading.sensor.sensor_id} - {obj.sensor_reading.sensor.location.name}"
    sensor_name.short_description = 'Sensor'
    
    def overall_aqi_display(self, obj):
        color_map = {
            'GOOD': 'green',
            'MODERATE': 'yellow',
            'UNHEALTHY_SG': 'orange',
            'UNHEALTHY': 'red',
            'VERY_UNHEALTHY': 'purple',
            'HAZARDOUS': 'maroon'
        }
        color = color_map.get(obj.aqi_status, 'black')
        return format_html('<span style="color: {}; font-weight: bold; font-size: 16px;">{:.1f}</span>', color, obj.overall_aqi)
    overall_aqi_display.short_description = 'Overall AQI'
    
    def aqi_status_display(self, obj):
        return obj.aqi_status.replace('_', ' ').title()
    aqi_status_display.short_description = 'Status'
    
    def aqi_breakdown(self, obj):
        breakdown = f"""
        <table style="border-collapse: collapse; width: 100%;">
            <tr><th style="border: 1px solid #ddd; padding: 8px;">Pollutant</th><th style="border: 1px solid #ddd; padding: 8px;">AQI</th><th style="border: 1px solid #ddd; padding: 8px;">Concentration</th></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">PM2.5</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_pm25:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.pm25:.2f} µg/m³</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">PM10</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_pm10:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.pm10:.2f} µg/m³</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">CO</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_co:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.co:.2f} ppm</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">NO2</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_no2:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.no2:.2f} ppb</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">SO2</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_so2:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.so2:.2f} ppb</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px;">O3</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.aqi_o3:.1f}</td><td style="border: 1px solid #ddd; padding: 8px;">{obj.sensor_reading.o3:.2f} ppb</td></tr>
        </table>
        """
        return mark_safe(breakdown)
    aqi_breakdown.short_description = 'AQI Breakdown'

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['sensor', 'alert_type', 'severity_display', 'title', 'is_active', 'acknowledged', 'created_at']
    list_filter = ['alert_type', 'severity', 'is_active', 'acknowledged', 'created_at']
    search_fields = ['sensor__sensor_id', 'sensor__location__name', 'title', 'message']
    readonly_fields = ['id', 'created_at', 'updated_at']
    actions = ['acknowledge_alerts', 'deactivate_alerts']
    date_hierarchy = 'created_at'
    
    def severity_display(self, obj):
        color_map = {
            'INFO': 'blue',
            'WARNING': 'orange',
            'CRITICAL': 'red',
            'EMERGENCY': 'darkred'
        }
        color = color_map.get(obj.severity, 'black')
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, obj.severity)
    severity_display.short_description = 'Severity'
    
    def acknowledge_alerts(self, request, queryset):
        from django.utils import timezone
        queryset.update(acknowledged=True, acknowledged_at=timezone.now())
        self.message_user(request, f"{queryset.count()} alerts acknowledged.")
    acknowledge_alerts.short_description = "Acknowledge selected alerts"
    
    def deactivate_alerts(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f"{queryset.count()} alerts deactivated.")
    deactivate_alerts.short_description = "Deactivate selected alerts"

@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['location', 'notification_method', 'custom_aqi_threshold', 'update_frequency_minutes']
    list_filter = ['notification_method', 'location__city']
    search_fields = ['location__name', 'email', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at']

# Customize admin site header
admin.site.site_header = "AQI Monitoring System Admin"
admin.site.site_title = "AQI Admin"
admin.site.index_title = "Air Quality Index Management"