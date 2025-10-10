#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aqi_backend.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from monitoring.models import SensorReading, AQICalculation
from monitoring.utils import calculate_aqi_from_sensor_reading

def calculate_aqi_for_all_readings():
    """Calculate AQI for all readings that don't have calculations"""
    
    # Get recent readings that don't have AQI calculations
    readings_without_aqi = SensorReading.objects.filter(aqi_calculation__isnull=True).order_by('-timestamp')[:50]
    print(f'Processing {readings_without_aqi.count()} readings...')
    
    success_count = 0
    error_count = 0
    
    for reading in readings_without_aqi:
        try:
            aqi_data = calculate_aqi_from_sensor_reading(reading)
            aqi_calc = AQICalculation.objects.create(
                sensor_reading=reading,
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
            print(f'✓ Created AQI for {reading.sensor.sensor_id}: {aqi_data["overall_aqi"]:.1f} ({aqi_data["aqi_status"]})')
            success_count += 1
        except Exception as e:
            print(f'✗ Error processing reading {reading.id}: {e}')
            error_count += 1
    
    print(f'\nSummary:')
    print(f'Successfully processed: {success_count}')
    print(f'Errors: {error_count}')
    print(f'Total AQI calculations now: {AQICalculation.objects.count()}')

if __name__ == '__main__':
    calculate_aqi_for_all_readings()