import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import SensorReading, AQICalculation, Alert
from .serializers import AQICalculationSerializer, AlertSerializer
import logging

logger = logging.getLogger(__name__)

class AQIConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time AQI updates"""
    
    async def connect(self):
        self.location_id = self.scope['url_route']['kwargs'].get('location_id', 'all')
        self.room_group_name = f'aqi_{self.location_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial data
        await self.send_initial_data()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'get_current_data':
                await self.send_current_data()
            elif message_type == 'subscribe_alerts':
                await self.subscribe_to_alerts()
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    async def send_initial_data(self):
        """Send initial AQI data when client connects"""
        try:
            current_data = await self.get_current_aqi_data()
            await self.send(text_data=json.dumps({
                'type': 'initial_data',
                'data': current_data
            }))
        except Exception as e:
            logger.error(f"Error sending initial data: {e}")
    
    async def send_current_data(self):
        """Send current AQI data on request"""
        try:
            current_data = await self.get_current_aqi_data()
            await self.send(text_data=json.dumps({
                'type': 'current_data',
                'data': current_data
            }))
        except Exception as e:
            logger.error(f"Error sending current data: {e}")
    
    async def subscribe_to_alerts(self):
        """Subscribe to alert notifications"""
        await self.channel_layer.group_add(
            f'alerts_{self.location_id}',
            self.channel_name
        )
        
        await self.send(text_data=json.dumps({
            'type': 'subscribed',
            'message': 'Subscribed to alerts'
        }))
    
    @database_sync_to_async
    def get_current_aqi_data(self):
        """Get current AQI data from database"""
        if self.location_id == 'all':
            # Get latest AQI for all locations
            latest_calculations = AQICalculation.objects.select_related(
                'sensor_reading__sensor__location'
            ).order_by('sensor_reading__sensor__location', '-calculated_at').distinct('sensor_reading__sensor__location')
        else:
            # Get latest AQI for specific location
            latest_calculations = AQICalculation.objects.filter(
                sensor_reading__sensor__location_id=self.location_id
            ).select_related(
                'sensor_reading__sensor__location'
            ).order_by('-calculated_at')[:1]
        
        serializer = AQICalculationSerializer(latest_calculations, many=True)
        return serializer.data
    
    # Handle messages from room group
    async def aqi_update(self, event):
        """Handle AQI update from group"""
        aqi_data = event['aqi_data']
        
        await self.send(text_data=json.dumps({
            'type': 'aqi_update',
            'data': aqi_data
        }))
    
    async def alert_notification(self, event):
        """Handle alert notification from group"""
        alert_data = event['alert_data']
        
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'data': alert_data
        }))

class AlertConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time alert notifications"""
    
    async def connect(self):
        self.location_id = self.scope['url_route']['kwargs'].get('location_id', 'all')
        self.room_group_name = f'alerts_{self.location_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send active alerts
        await self.send_active_alerts()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'get_active_alerts':
                await self.send_active_alerts()
            elif message_type == 'acknowledge_alert':
                alert_id = text_data_json.get('alert_id')
                await self.acknowledge_alert(alert_id)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    async def send_active_alerts(self):
        """Send current active alerts"""
        try:
            active_alerts = await self.get_active_alerts()
            await self.send(text_data=json.dumps({
                'type': 'active_alerts',
                'data': active_alerts
            }))
        except Exception as e:
            logger.error(f"Error sending active alerts: {e}")
    
    @database_sync_to_async
    def get_active_alerts(self):
        """Get active alerts from database"""
        if self.location_id == 'all':
            alerts = Alert.objects.filter(
                is_active=True,
                acknowledged=False
            ).select_related('sensor__location').order_by('-created_at')
        else:
            alerts = Alert.objects.filter(
                sensor__location_id=self.location_id,
                is_active=True,
                acknowledged=False
            ).select_related('sensor__location').order_by('-created_at')
        
        serializer = AlertSerializer(alerts, many=True)
        return serializer.data
    
    @database_sync_to_async
    def acknowledge_alert(self, alert_id):
        """Acknowledge an alert"""
        try:
            alert = Alert.objects.get(id=alert_id)
            alert.acknowledged = True
            alert.acknowledged_at = timezone.now()
            alert.save()
            return True
        except Alert.DoesNotExist:
            return False
    
    # Handle messages from room group
    async def new_alert(self, event):
        """Handle new alert from group"""
        alert_data = event['alert_data']
        
        await self.send(text_data=json.dumps({
            'type': 'new_alert',
            'data': alert_data
        }))
    
    async def alert_acknowledged(self, event):
        """Handle alert acknowledgment from group"""
        alert_id = event['alert_id']
        
        await self.send(text_data=json.dumps({
            'type': 'alert_acknowledged',
            'alert_id': alert_id
        }))

class DashboardConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for dashboard real-time updates"""
    
    async def connect(self):
        self.room_group_name = 'dashboard'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial dashboard data
        await self.send_dashboard_data()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle messages from WebSocket"""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'refresh_dashboard':
                await self.send_dashboard_data()
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    async def send_dashboard_data(self):
        """Send dashboard summary data"""
        try:
            dashboard_data = await self.get_dashboard_data()
            await self.send(text_data=json.dumps({
                'type': 'dashboard_data',
                'data': dashboard_data,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error sending dashboard data: {e}")
    
    @database_sync_to_async
    def get_dashboard_data(self):
        """Get dashboard summary data"""
        from .models import Location
        from .serializers import DashboardLocationSerializer
        
        locations = Location.objects.prefetch_related(
            'sensors__readings__aqi_calculation'
        ).all()
        
        serializer = DashboardLocationSerializer(locations, many=True)
        
        # Add summary statistics
        total_alerts = Alert.objects.filter(is_active=True, acknowledged=False).count()
        total_sensors = Alert.objects.filter(status='ACTIVE').count()
        
        return {
            'locations': serializer.data,
            'summary': {
                'total_alerts': total_alerts,
                'total_sensors': total_sensors,
                'last_updated': timezone.now().isoformat()
            }
        }
    
    # Handle messages from room group
    async def dashboard_update(self, event):
        """Handle dashboard update from group"""
        await self.send_dashboard_data()