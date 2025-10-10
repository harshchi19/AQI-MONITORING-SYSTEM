from django.core.management.base import BaseCommand
from django.utils import timezone
from monitoring.models import Location, Sensor, SensorReading
from datetime import datetime, timedelta
import random
import math

class Command(BaseCommand):
    help = 'Generate realistic sensor data for testing'
    
    def add_arguments(self, parser):
        parser.add_argument('--hours', type=int, default=24, help='Hours of data to generate')
        parser.add_argument('--interval', type=int, default=5, help='Interval between readings in minutes')
        parser.add_argument('--clean', action='store_true', help='Clean existing data first')
    
    def handle(self, *args, **options):
        if options['clean']:
            self.stdout.write("Cleaning existing data...")
            SensorReading.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Existing data cleaned"))
        
        # Create locations and sensors if they don't exist
        self.create_locations_and_sensors()
        
        # Generate data
        hours = options['hours']
        interval_minutes = options['interval']
        
        self.stdout.write(f"Generating {hours} hours of data with {interval_minutes}-minute intervals...")
        
        readings_per_hour = 60 // interval_minutes
        total_readings = hours * readings_per_hour
        
        self.generate_realistic_data(hours, interval_minutes)
        
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully generated {total_readings} readings per sensor for {hours} hours"
            )
        )
    
    def create_locations_and_sensors(self):
        """Create sample locations and sensors"""
        locations_data = [
            {'name': 'Mumbai_Central', 'city': 'Mumbai', 'state': 'Maharashtra', 'lat': 19.0760, 'lng': 72.8777},
            {'name': 'Delhi_North', 'city': 'Delhi', 'state': 'Delhi', 'lat': 28.7041, 'lng': 77.1025},
            {'name': 'Bangalore_East', 'city': 'Bangalore', 'state': 'Karnataka', 'lat': 12.9716, 'lng': 77.5946},
            {'name': 'Chennai_South', 'city': 'Chennai', 'state': 'Tamil Nadu', 'lat': 13.0827, 'lng': 80.2707},
            {'name': 'Kolkata_West', 'city': 'Kolkata', 'state': 'West Bengal', 'lat': 22.5726, 'lng': 88.3639},
        ]
        
        for i, loc_data in enumerate(locations_data, 1):
            location, created = Location.objects.get_or_create(
                name=loc_data['name'],
                defaults={
                    'city': loc_data['city'],
                    'state': loc_data['state'],
                    'latitude': loc_data['lat'],
                    'longitude': loc_data['lng'],
                }
            )
            
            if created:
                self.stdout.write(f"Created location: {location.name}")
            
            # Create sensor for this location
            sensor_id = f"SENSOR_{i}"
            sensor, created = Sensor.objects.get_or_create(
                sensor_id=sensor_id,
                defaults={
                    'location': location,
                    'status': 'ACTIVE',
                    'installed_date': timezone.now() - timedelta(days=30)
                }
            )
            
            if created:
                self.stdout.write(f"Created sensor: {sensor.sensor_id}")
    
    def generate_realistic_data(self, hours, interval_minutes):
        """Generate realistic sequential sensor data"""
        
        # Location profiles with different base pollution levels
        location_profiles = {
            'Mumbai_Central': {'base_pm25': 45, 'base_pm10': 80, 'base_co': 6, 'base_no2': 40, 'base_so2': 20, 'base_o3': 50},
            'Delhi_North': {'base_pm25': 60, 'base_pm10': 100, 'base_co': 8, 'base_no2': 50, 'base_so2': 25, 'base_o3': 45},
            'Bangalore_East': {'base_pm25': 35, 'base_pm10': 65, 'base_co': 5, 'base_no2': 35, 'base_so2': 15, 'base_o3': 55},
            'Chennai_South': {'base_pm25': 40, 'base_pm10': 75, 'base_co': 5.5, 'base_no2': 38, 'base_so2': 18, 'base_o3': 52},
            'Kolkata_West': {'base_pm25': 55, 'base_pm10': 90, 'base_co': 7, 'base_no2': 45, 'base_so2': 22, 'base_o3': 48}
        }
        
        base_time = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=hours)
        readings_per_hour = 60 // interval_minutes
        total_readings = hours * readings_per_hour
        
        sensors = Sensor.objects.all()
        
        for sensor in sensors:
            profile = location_profiles.get(sensor.location.name, location_profiles['Mumbai_Central'])
            
            # Store previous values for smooth transitions
            prev_values = {
                'PM25': profile['base_pm25'],
                'PM10': profile['base_pm10'],
                'CO': profile['base_co'],
                'NO2': profile['base_no2'],
                'SO2': profile['base_so2'],
                'O3': profile['base_o3']
            }
            
            readings_to_create = []
            
            for i in range(total_readings):
                timestamp = base_time + timedelta(minutes=i * interval_minutes)
                hour = timestamp.hour
                
                # Generate target values with realistic variations
                target_pm25 = self.add_realistic_variation(profile['base_pm25'], hour, 'PM25')
                target_pm10 = self.add_realistic_variation(profile['base_pm10'], hour, 'PM10')
                target_co = self.add_realistic_variation(profile['base_co'], hour, 'CO')
                target_no2 = self.add_realistic_variation(profile['base_no2'], hour, 'NO2')
                target_so2 = self.add_realistic_variation(profile['base_so2'], hour, 'SO2')
                target_o3 = self.add_realistic_variation(profile['base_o3'], hour, 'O3')
                
                # Apply smoothing for realistic sequential values
                pm25 = self.smooth_transition(prev_values['PM25'], target_pm25)
                pm10 = self.smooth_transition(prev_values['PM10'], target_pm10)
                co = self.smooth_transition(prev_values['CO'], target_co)
                no2 = self.smooth_transition(prev_values['NO2'], target_no2)
                so2 = self.smooth_transition(prev_values['SO2'], target_so2)
                o3 = self.smooth_transition(prev_values['O3'], target_o3)
                
                # Occasionally inject pollution spikes (5% chance)
                if random.random() < 0.05:
                    spike_pollutant = random.choice(['PM25', 'PM10', 'NO2', 'CO'])
                    if spike_pollutant == 'PM25':
                        pm25 *= random.uniform(2.0, 3.5)
                        pm10 *= random.uniform(1.5, 2.5)
                    elif spike_pollutant == 'NO2':
                        no2 *= random.uniform(2.5, 4.0)
                    elif spike_pollutant == 'CO':
                        co *= random.uniform(2.0, 3.0)
                
                # Update previous values
                prev_values = {
                    'PM25': pm25, 'PM10': pm10, 'CO': co,
                    'NO2': no2, 'SO2': so2, 'O3': o3
                }
                
                # Add meteorological data
                temperature = 20 + 10 * math.sin((hour - 6) * math.pi / 12) + random.gauss(0, 2)
                humidity = max(30, min(90, 60 + random.gauss(0, 15)))
                wind_speed = max(0, random.expovariate(1/3))
                wind_direction = random.uniform(0, 360)
                
                readings_to_create.append(SensorReading(
                    sensor=sensor,
                    timestamp=timestamp,
                    pm25=round(max(0, pm25), 2),
                    pm10=round(max(0, pm10), 2),
                    co=round(max(0, co), 2),
                    no2=round(max(0, no2), 2),
                    so2=round(max(0, so2), 2),
                    o3=round(max(0, o3), 2),
                    temperature=round(temperature, 1),
                    humidity=round(humidity, 1),
                    wind_speed=round(wind_speed, 1),
                    wind_direction=round(wind_direction, 1)
                ))
            
            # Batch create readings for this sensor
            SensorReading.objects.bulk_create(readings_to_create, batch_size=100)
            self.stdout.write(f"Generated {len(readings_to_create)} readings for {sensor.sensor_id}")
    
    def add_realistic_variation(self, base_value, hour, pollutant_type, variation_scale=0.15):
        """Add realistic temporal and random variations to base values"""
        # Traffic pattern (higher during rush hours: 7-10 AM and 5-8 PM)
        traffic_factor = 1.0
        if 7 <= hour <= 10 or 17 <= hour <= 20:
            traffic_factor = 1.3 if pollutant_type in ['NO2', 'CO', 'PM25', 'PM10'] else 1.0
        
        # Night reduction (lower pollution 11 PM - 5 AM)
        if 23 <= hour or hour <= 5:
            traffic_factor = 0.7
        
        # Afternoon ozone increase
        if 12 <= hour <= 16 and pollutant_type == 'O3':
            traffic_factor = 1.4
        
        # Add smooth random variation
        random_factor = 1.0 + random.gauss(0, variation_scale)
        
        return base_value * traffic_factor * random_factor
    
    def smooth_transition(self, prev_value, target_value, smoothing=0.7):
        """Create smooth transitions between readings"""
        return prev_value * smoothing + target_value * (1 - smoothing)