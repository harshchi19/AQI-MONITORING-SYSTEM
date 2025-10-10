from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Max, Min, Count, Q
from datetime import timedelta, datetime
from monitoring.models import Location, AQICalculation, Alert, SensorReading
from collections import defaultdict

@api_view(['GET'])
def dashboard_analytics(request):
    """Get comprehensive dashboard analytics"""
    try:
        # Time period filter
        hours = int(request.query_params.get('hours', 24))
        since = timezone.now() - timedelta(hours=hours)
        
        # Overall statistics
        recent_calculations = AQICalculation.objects.filter(calculated_at__gte=since)
        
        overall_stats = recent_calculations.aggregate(
            avg_aqi=Avg('overall_aqi'),
            max_aqi=Max('overall_aqi'),
            min_aqi=Min('overall_aqi'),
            total_readings=Count('id')
        )
        
        # AQI status distribution
        status_distribution = recent_calculations.values('aqi_status').annotate(
            count=Count('id'),
            percentage=Count('id') * 100.0 / Count('*')
        ).order_by('aqi_status')
        
        # Location-wise current status
        location_status = []
        for location in Location.objects.all():
            latest_calc = AQICalculation.objects.filter(
                sensor_reading__sensor__location=location
            ).first()
            
            if latest_calc:
                location_status.append({
                    'location': location.name,
                    'city': location.city,
                    'current_aqi': latest_calc.overall_aqi,
                    'status': latest_calc.aqi_status,
                    'dominant_pollutant': latest_calc.dominant_pollutant,
                    'timestamp': latest_calc.calculated_at
                })
        
        # Alert summary
        active_alerts = Alert.objects.filter(is_active=True)
        alert_summary = {
            'total': active_alerts.count(),
            'unacknowledged': active_alerts.filter(acknowledged=False).count(),
            'by_severity': dict(active_alerts.values_list('severity').annotate(count=Count('id'))),
            'recent': list(active_alerts.order_by('-created_at')[:5].values(
                'id', 'sensor__sensor_id', 'sensor__location__name', 
                'severity', 'title', 'created_at'
            ))
        }
        
        # Hourly trends
        hourly_trends = []
        for i in range(24):
            hour_start = timezone.now().replace(hour=i, minute=0, second=0, microsecond=0)
            hour_end = hour_start + timedelta(hours=1)
            
            hour_avg = recent_calculations.filter(
                calculated_at__gte=hour_start,
                calculated_at__lt=hour_end
            ).aggregate(avg_aqi=Avg('overall_aqi'))
            
            hourly_trends.append({
                'hour': i,
                'avg_aqi': round(hour_avg['avg_aqi'] or 0, 2)
            })
        
        return Response({
            'timestamp': timezone.now(),
            'period_hours': hours,
            'overall_stats': overall_stats,
            'status_distribution': list(status_distribution),
            'location_status': location_status,
            'alert_summary': alert_summary,
            'hourly_trends': hourly_trends
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def trend_analysis(request):
    """Analyze AQI trends over time"""
    try:
        days = int(request.query_params.get('days', 7))
        location_id = request.query_params.get('location')
        
        since = timezone.now() - timedelta(days=days)
        queryset = AQICalculation.objects.filter(calculated_at__gte=since)
        
        if location_id:
            queryset = queryset.filter(sensor_reading__sensor__location_id=location_id)
        
        # Daily trends
        daily_trends = []
        for i in range(days):
            day = timezone.now().date() - timedelta(days=i)
            day_start = timezone.datetime.combine(day, timezone.datetime.min.time())
            day_end = day_start + timedelta(days=1)
            
            day_calcs = queryset.filter(
                calculated_at__gte=day_start,
                calculated_at__lt=day_end
            )
            
            daily_stats = day_calcs.aggregate(
                avg_aqi=Avg('overall_aqi'),
                max_aqi=Max('overall_aqi'),
                min_aqi=Min('overall_aqi'),
                count=Count('id')
            )
            
            daily_trends.append({
                'date': day.isoformat(),
                'avg_aqi': round(daily_stats['avg_aqi'] or 0, 2),
                'max_aqi': round(daily_stats['max_aqi'] or 0, 2),
                'min_aqi': round(daily_stats['min_aqi'] or 0, 2),
                'reading_count': daily_stats['count']
            })
        
        # Pollutant trends
        pollutant_trends = queryset.values('dominant_pollutant').annotate(
            count=Count('id'),
            avg_aqi=Avg('overall_aqi')
        ).order_by('-count')
        
        # Peak pollution hours
        hourly_averages = []
        for hour in range(24):
            hour_avg = queryset.filter(
                calculated_at__hour=hour
            ).aggregate(avg_aqi=Avg('overall_aqi'))
            
            hourly_averages.append({
                'hour': hour,
                'avg_aqi': round(hour_avg['avg_aqi'] or 0, 2)
            })
        
        return Response({
            'timestamp': timezone.now(),
            'period_days': days,
            'daily_trends': daily_trends,
            'pollutant_trends': list(pollutant_trends),
            'hourly_averages': hourly_averages
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def location_comparison(request):
    """Compare AQI across different locations"""
    try:
        days = int(request.query_params.get('days', 7))
        since = timezone.now() - timedelta(days=days)
        
        location_comparisons = []
        
        for location in Location.objects.all():
            location_calcs = AQICalculation.objects.filter(
                sensor_reading__sensor__location=location,
                calculated_at__gte=since
            )
            
            if location_calcs.exists():
                stats = location_calcs.aggregate(
                    avg_aqi=Avg('overall_aqi'),
                    max_aqi=Max('overall_aqi'),
                    min_aqi=Min('overall_aqi'),
                    count=Count('id')
                )
                
                # Status distribution for this location
                status_dist = location_calcs.values('aqi_status').annotate(
                    count=Count('id')
                ).order_by('aqi_status')
                
                # Alert count
                alert_count = Alert.objects.filter(
                    sensor__location=location,
                    created_at__gte=since,
                    is_active=True
                ).count()
                
                location_comparisons.append({
                    'location': {
                        'id': location.id,
                        'name': location.name,
                        'city': location.city,
                        'state': location.state
                    },
                    'statistics': {
                        'avg_aqi': round(stats['avg_aqi'], 2),
                        'max_aqi': round(stats['max_aqi'], 2),
                        'min_aqi': round(stats['min_aqi'], 2),
                        'reading_count': stats['count']
                    },
                    'status_distribution': list(status_dist),
                    'alert_count': alert_count
                })
        
        # Sort by average AQI (worst first)
        location_comparisons.sort(key=lambda x: x['statistics']['avg_aqi'], reverse=True)
        
        return Response({
            'timestamp': timezone.now(),
            'period_days': days,
            'locations': location_comparisons
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def generate_report(request):
    """Generate comprehensive AQI report"""
    try:
        report_type = request.query_params.get('type', 'summary')  # summary, detailed
        days = int(request.query_params.get('days', 30))
        location_id = request.query_params.get('location')
        
        since = timezone.now() - timedelta(days=days)
        queryset = AQICalculation.objects.filter(calculated_at__gte=since)
        
        if location_id:
            queryset = queryset.filter(sensor_reading__sensor__location_id=location_id)
            location = Location.objects.get(id=location_id)
            location_name = location.name
        else:
            location_name = "All Locations"
        
        # Basic statistics
        overall_stats = queryset.aggregate(
            avg_aqi=Avg('overall_aqi'),
            max_aqi=Max('overall_aqi'),
            min_aqi=Min('overall_aqi'),
            total_readings=Count('id')
        )
        
        # Air quality days breakdown
        good_days = queryset.filter(overall_aqi__lte=50).count()
        moderate_days = queryset.filter(overall_aqi__gt=50, overall_aqi__lte=100).count()
        unhealthy_days = queryset.filter(overall_aqi__gt=100).count()
        
        # Worst air quality days
        worst_days = list(queryset.order_by('-overall_aqi')[:10].values(
            'overall_aqi', 'aqi_status', 'dominant_pollutant', 
            'calculated_at', 'sensor_reading__sensor__location__name'
        ))
        
        # Pollutant analysis
        pollutant_analysis = queryset.values('dominant_pollutant').annotate(
            count=Count('id'),
            avg_aqi=Avg('overall_aqi'),
            max_aqi=Max('overall_aqi')
        ).order_by('-count')
        
        # Health recommendations based on overall air quality
        avg_aqi = overall_stats['avg_aqi'] or 0
        if avg_aqi <= 50:
            health_recommendation = "Air quality is generally good. No special precautions needed."
        elif avg_aqi <= 100:
            health_recommendation = "Air quality is moderate. Sensitive individuals should limit outdoor activities."
        elif avg_aqi <= 150:
            health_recommendation = "Air quality is unhealthy for sensitive groups. Consider wearing masks outdoors."
        else:
            health_recommendation = "Air quality is concerning. Everyone should limit outdoor activities and use air purifiers."
        
        report = {
            'report_info': {
                'type': report_type,
                'period_days': days,
                'location': location_name,
                'generated_at': timezone.now(),
                'data_points': overall_stats['total_readings']
            },
            'executive_summary': {
                'average_aqi': round(avg_aqi, 2),
                'max_aqi_recorded': round(overall_stats['max_aqi'] or 0, 2),
                'good_air_days': good_days,
                'moderate_air_days': moderate_days,
                'unhealthy_air_days': unhealthy_days,
                'health_recommendation': health_recommendation
            },
            'detailed_analysis': {
                'pollutant_breakdown': list(pollutant_analysis),
                'worst_air_quality_events': worst_days,
                'alert_summary': {
                    'total_alerts': Alert.objects.filter(
                        created_at__gte=since
                    ).count() if not location_id else Alert.objects.filter(
                        sensor__location_id=location_id,
                        created_at__gte=since
                    ).count()
                }
            }
        }
        
        return Response(report)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])  
def aqi_forecast(request):
    """Simple AQI forecasting based on historical trends"""
    try:
        location_id = request.query_params.get('location')
        days_history = int(request.query_params.get('history_days', 7))
        
        # Get historical data
        since = timezone.now() - timedelta(days=days_history)
        if location_id:
            historical_data = AQICalculation.objects.filter(
                sensor_reading__sensor__location_id=location_id,
                calculated_at__gte=since
            ).order_by('calculated_at')
        else:
            historical_data = AQICalculation.objects.filter(
                calculated_at__gte=since
            ).order_by('calculated_at')
        
        if not historical_data.exists():
            return Response({'error': 'Insufficient historical data'}, status=400)
        
        # Simple moving average forecast (can be enhanced with ML models)
        recent_values = list(historical_data.values_list('overall_aqi', flat=True)[-24:])  # Last 24 readings
        
        if len(recent_values) < 5:
            return Response({'error': 'Need at least 5 recent readings'}, status=400)
        
        # Calculate trend
        moving_avg = sum(recent_values) / len(recent_values)
        trend = (recent_values[-1] - recent_values[0]) / len(recent_values)
        
        # Generate 24-hour forecast
        forecast = []
        for i in range(24):
            forecast_time = timezone.now() + timedelta(hours=i+1)
            predicted_aqi = max(0, moving_avg + (trend * i))
            
            # Add some seasonal/hourly adjustments (simplified)
            hour = forecast_time.hour
            if 7 <= hour <= 10 or 17 <= hour <= 20:  # Rush hours
                predicted_aqi *= 1.2
            elif 22 <= hour or hour <= 5:  # Night time
                predicted_aqi *= 0.8
                
            # Determine predicted status
            if predicted_aqi <= 50:
                status = 'GOOD'
            elif predicted_aqi <= 100:
                status = 'MODERATE'
            elif predicted_aqi <= 150:
                status = 'UNHEALTHY_SG'
            elif predicted_aqi <= 200:
                status = 'UNHEALTHY'
            elif predicted_aqi <= 300:
                status = 'VERY_UNHEALTHY'
            else:
                status = 'HAZARDOUS'
            
            forecast.append({
                'timestamp': forecast_time,
                'predicted_aqi': round(predicted_aqi, 1),
                'predicted_status': status,
                'confidence': max(0.3, 1.0 - (i * 0.02))  # Decreasing confidence over time
            })
        
        return Response({
            'timestamp': timezone.now(),
            'forecast_period': '24 hours',
            'based_on_days': days_history,
            'current_trend': 'improving' if trend < 0 else 'worsening' if trend > 0 else 'stable',
            'forecast': forecast,
            'disclaimer': 'This is a simple statistical forecast. Actual conditions may vary due to weather and other factors.'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)