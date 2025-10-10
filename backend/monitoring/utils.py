"""
AQI Calculation utilities based on EPA standards
"""
import logging
from typing import Dict, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class AQIBreakpoint:
    """Data class for AQI breakpoint values"""
    concentration_low: float
    concentration_high: float
    aqi_low: int
    aqi_high: int

class AQICalculator:
    """
    Air Quality Index Calculator following EPA standards
    """
    
    # EPA AQI Breakpoints for different pollutants
    PM25_BREAKPOINTS = [
        AQIBreakpoint(0.0, 12.0, 0, 50),
        AQIBreakpoint(12.1, 35.4, 51, 100),
        AQIBreakpoint(35.5, 55.4, 101, 150),
        AQIBreakpoint(55.5, 150.4, 151, 200),
        AQIBreakpoint(150.5, 250.4, 201, 300),
        AQIBreakpoint(250.5, 500.0, 301, 500),
    ]
    
    PM10_BREAKPOINTS = [
        AQIBreakpoint(0, 54, 0, 50),
        AQIBreakpoint(55, 154, 51, 100),
        AQIBreakpoint(155, 254, 101, 150),
        AQIBreakpoint(255, 354, 151, 200),
        AQIBreakpoint(355, 424, 201, 300),
        AQIBreakpoint(425, 604, 301, 500),
    ]
    
    CO_BREAKPOINTS = [
        AQIBreakpoint(0.0, 4.4, 0, 50),
        AQIBreakpoint(4.5, 9.4, 51, 100),
        AQIBreakpoint(9.5, 12.4, 101, 150),
        AQIBreakpoint(12.5, 15.4, 151, 200),
        AQIBreakpoint(15.5, 30.4, 201, 300),
        AQIBreakpoint(30.5, 50.0, 301, 500),
    ]
    
    NO2_BREAKPOINTS = [
        AQIBreakpoint(0, 53, 0, 50),
        AQIBreakpoint(54, 100, 51, 100),
        AQIBreakpoint(101, 360, 101, 150),
        AQIBreakpoint(361, 649, 151, 200),
        AQIBreakpoint(650, 1249, 201, 300),
        AQIBreakpoint(1250, 2049, 301, 500),
    ]
    
    SO2_BREAKPOINTS = [
        AQIBreakpoint(0, 35, 0, 50),
        AQIBreakpoint(36, 75, 51, 100),
        AQIBreakpoint(76, 185, 101, 150),
        AQIBreakpoint(186, 304, 151, 200),
        AQIBreakpoint(305, 604, 201, 300),
        AQIBreakpoint(605, 1004, 301, 500),
    ]
    
    O3_BREAKPOINTS = [
        AQIBreakpoint(0, 54, 0, 50),
        AQIBreakpoint(55, 70, 51, 100),
        AQIBreakpoint(71, 85, 101, 150),
        AQIBreakpoint(86, 105, 151, 200),
        AQIBreakpoint(106, 200, 201, 300),
    ]
    
    # Pollutant breakpoint mapping
    BREAKPOINT_MAP = {
        'PM25': PM25_BREAKPOINTS,
        'PM10': PM10_BREAKPOINTS,
        'CO': CO_BREAKPOINTS,
        'NO2': NO2_BREAKPOINTS,
        'SO2': SO2_BREAKPOINTS,
        'O3': O3_BREAKPOINTS,
    }
    
    # AQI status mapping
    AQI_STATUS_MAP = {
        (0, 50): 'GOOD',
        (51, 100): 'MODERATE',
        (101, 150): 'UNHEALTHY_SG',
        (151, 200): 'UNHEALTHY',
        (201, 300): 'VERY_UNHEALTHY',
        (301, 500): 'HAZARDOUS',
    }
    
    # Safe thresholds for alerts
    SAFE_THRESHOLDS = {
        'PM25': 55.4,
        'PM10': 154,
        'CO': 9.4,
        'NO2': 100,
        'SO2': 75,
        'O3': 70,
    }
    
    @classmethod
    def calculate_aqi_component(cls, concentration: float, breakpoints: list) -> float:
        """
        Calculate AQI for a single pollutant using EPA formula
        
        Formula: AQI = ((I_high - I_low) / (C_high - C_low)) * (C - C_low) + I_low
        
        Where:
        - C = concentration
        - C_low = breakpoint concentration <= C
        - C_high = breakpoint concentration >= C
        - I_low = AQI corresponding to C_low
        - I_high = AQI corresponding to C_high
        """
        if concentration is None or concentration < 0:
            return 0.0
        
        try:
            # Find appropriate breakpoint
            for bp in breakpoints:
                if bp.concentration_low <= concentration <= bp.concentration_high:
                    # Apply EPA AQI formula
                    aqi = (
                        ((bp.aqi_high - bp.aqi_low) / (bp.concentration_high - bp.concentration_low)) * 
                        (concentration - bp.concentration_low) + bp.aqi_low
                    )
                    return round(aqi, 1)
            
            # If concentration exceeds highest breakpoint, return maximum AQI
            return 500.0
            
        except Exception as e:
            logger.error(f"Error calculating AQI component: {e}")
            return 0.0
    
    @classmethod
    def calculate_pm25_aqi(cls, concentration: float) -> float:
        """Calculate AQI for PM2.5"""
        return cls.calculate_aqi_component(concentration, cls.PM25_BREAKPOINTS)
    
    @classmethod
    def calculate_pm10_aqi(cls, concentration: float) -> float:
        """Calculate AQI for PM10"""
        return cls.calculate_aqi_component(concentration, cls.PM10_BREAKPOINTS)
    
    @classmethod
    def calculate_co_aqi(cls, concentration: float) -> float:
        """Calculate AQI for CO"""
        return cls.calculate_aqi_component(concentration, cls.CO_BREAKPOINTS)
    
    @classmethod
    def calculate_no2_aqi(cls, concentration: float) -> float:
        """Calculate AQI for NO2"""
        return cls.calculate_aqi_component(concentration, cls.NO2_BREAKPOINTS)
    
    @classmethod
    def calculate_so2_aqi(cls, concentration: float) -> float:
        """Calculate AQI for SO2"""
        return cls.calculate_aqi_component(concentration, cls.SO2_BREAKPOINTS)
    
    @classmethod
    def calculate_o3_aqi(cls, concentration: float) -> float:
        """Calculate AQI for O3"""
        return cls.calculate_aqi_component(concentration, cls.O3_BREAKPOINTS)
    
    @classmethod
    def get_aqi_status(cls, aqi_value: float) -> str:
        """Get AQI status based on value"""
        for (low, high), status in cls.AQI_STATUS_MAP.items():
            if low <= aqi_value <= high:
                return status
        return 'HAZARDOUS'  # Default for values > 500
    
    @classmethod
    def get_dominant_pollutant(cls, aqi_components: Dict[str, float]) -> str:
        """Determine which pollutant is contributing most to overall AQI"""
        max_aqi = 0
        dominant = 'PM25'  # Default
        
        for pollutant, aqi_value in aqi_components.items():
            if aqi_value > max_aqi:
                max_aqi = aqi_value
                dominant = pollutant
        
        return dominant
    
    @classmethod
    def calculate_full_aqi(cls, sensor_data: Dict[str, float]) -> Dict[str, any]:
        """
        Calculate complete AQI analysis for sensor reading
        
        Args:
            sensor_data: Dictionary containing pollutant concentrations
                        Keys: PM25, PM10, CO, NO2, SO2, O3
        
        Returns:
            Dictionary containing:
            - Individual AQI components
            - Overall AQI (maximum of all components)
            - AQI status
            - Dominant pollutant
            - Alert information
        """
        try:
            # Calculate individual AQI components
            aqi_components = {
                'PM25': cls.calculate_pm25_aqi(sensor_data.get('PM25', 0)),
                'PM10': cls.calculate_pm10_aqi(sensor_data.get('PM10', 0)),
                'CO': cls.calculate_co_aqi(sensor_data.get('CO', 0)),
                'NO2': cls.calculate_no2_aqi(sensor_data.get('NO2', 0)),
                'SO2': cls.calculate_so2_aqi(sensor_data.get('SO2', 0)),
                'O3': cls.calculate_o3_aqi(sensor_data.get('O3', 0)),
            }
            
            # Overall AQI is the maximum of all components
            overall_aqi = max(aqi_components.values())
            
            # Determine status and dominant pollutant
            aqi_status = cls.get_aqi_status(overall_aqi)
            dominant_pollutant = cls.get_dominant_pollutant(aqi_components)
            
            # Generate alert information
            alerts = cls.generate_alerts(sensor_data, overall_aqi, aqi_status)
            
            return {
                'aqi_components': aqi_components,
                'overall_aqi': round(overall_aqi, 1),
                'aqi_status': aqi_status,
                'dominant_pollutant': dominant_pollutant,
                'alerts': alerts,
                'timestamp': None,  # Will be set by caller
            }
            
        except Exception as e:
            logger.error(f"Error calculating full AQI: {e}")
            raise
    
    @classmethod
    def generate_alerts(cls, sensor_data: Dict[str, float], overall_aqi: float, aqi_status: str) -> Dict[str, any]:
        """Generate alert messages based on pollutant levels and AQI"""
        alerts = {
            'has_alert': overall_aqi > 100,
            'severity': cls.get_alert_severity(overall_aqi),
            'messages': [],
            'recommendations': [],
        }
        
        if overall_aqi <= 50:
            alerts['messages'].append("Air quality is Good. No precautions needed.")
            alerts['recommendations'].append("Enjoy outdoor activities!")
        elif overall_aqi <= 100:
            alerts['messages'].append("Air quality is Moderate. Sensitive individuals should consider limiting prolonged outdoor exertion.")
            alerts['recommendations'].append("Sensitive individuals should limit outdoor activities.")
        else:
            # Generate specific pollutant alerts
            pollutant_alerts = []
            
            for pollutant, concentration in sensor_data.items():
                threshold = cls.SAFE_THRESHOLDS.get(pollutant, float('inf'))
                if concentration > threshold:
                    alert_msg = cls.get_pollutant_alert_message(pollutant, concentration, threshold)
                    if alert_msg:
                        pollutant_alerts.append(alert_msg)
            
            if pollutant_alerts:
                base_message = f"Air quality is {aqi_status.replace('_', ' ').title()}. Pollutants detected: "
                alerts['messages'].append(base_message + " ".join(pollutant_alerts))
            
            # Add recommendations based on AQI level
            alerts['recommendations'].extend(cls.get_health_recommendations(aqi_status))
        
        return alerts
    
    @classmethod
    def get_alert_severity(cls, aqi_value: float) -> str:
        """Determine alert severity based on AQI value"""
        if aqi_value <= 50:
            return 'INFO'
        elif aqi_value <= 100:
            return 'INFO'
        elif aqi_value <= 150:
            return 'WARNING'
        elif aqi_value <= 200:
            return 'WARNING'
        elif aqi_value <= 300:
            return 'CRITICAL'
        else:
            return 'EMERGENCY'
    
    @classmethod
    def get_pollutant_alert_message(cls, pollutant: str, concentration: float, threshold: float) -> str:
        """Generate specific alert message for a pollutant"""
        pollutant_info = {
            'PM25': {
                'name': 'PM2.5',
                'unit': 'µg/m³',
                'action': 'Wear N95 masks and use air purifiers.'
            },
            'PM10': {
                'name': 'PM10',
                'unit': 'µg/m³',
                'action': 'Avoid outdoor activities.'
            },
            'CO': {
                'name': 'CO',
                'unit': 'ppm',
                'action': 'Ensure proper ventilation and check for gas leaks.'
            },
            'NO2': {
                'name': 'NO2',
                'unit': 'ppb',
                'action': 'Reduce vehicle usage and stay indoors.'
            },
            'SO2': {
                'name': 'SO2',
                'unit': 'ppb',
                'action': 'Avoid industrial areas and seek medical help if needed.'
            },
            'O3': {
                'name': 'O3',
                'unit': 'ppb',
                'action': 'Limit outdoor activities during peak hours.'
            }
        }
        
        info = pollutant_info.get(pollutant)
        if not info:
            return ""
        
        return (f"{info['name']} level is {concentration:.2f} {info['unit']} "
                f"(Safe: 0-{threshold} {info['unit']}). {info['action']} ")
    
    @classmethod
    def get_health_recommendations(cls, aqi_status: str) -> list:
        """Get health recommendations based on AQI status"""
        recommendations = {
            'GOOD': [
                "Air quality is satisfactory for outdoor activities."
            ],
            'MODERATE': [
                "Unusually sensitive people should consider limiting prolonged outdoor exertion."
            ],
            'UNHEALTHY_SG': [
                "Children, elderly, and people with heart/lung disease should limit outdoor activities.",
                "Consider wearing masks when outdoors.",
                "Use air purifiers indoors."
            ],
            'UNHEALTHY': [
                "Everyone should limit outdoor activities.",
                "Wear N95 masks when going outside.",
                "Keep windows closed and use air purifiers.",
                "People with heart/lung disease should stay indoors."
            ],
            'VERY_UNHEALTHY': [
                "Everyone should avoid outdoor activities.",
                "Stay indoors with air purifiers running.",
                "Seek medical attention if experiencing symptoms.",
                "Schools should cancel outdoor activities."
            ],
            'HAZARDOUS': [
                "Emergency conditions - everyone should stay indoors.",
                "Seek immediate medical attention if experiencing symptoms.",
                "Consider evacuating the area if possible.",
                "All outdoor activities should be cancelled."
            ]
        }
        
        return recommendations.get(aqi_status, [])

# Utility functions for easy access
def calculate_aqi_from_sensor_reading(sensor_reading) -> Dict[str, any]:
    """Calculate AQI from a SensorReading model instance"""
    sensor_data = {
        'PM25': sensor_reading.pm25,
        'PM10': sensor_reading.pm10,
        'CO': sensor_reading.co,
        'NO2': sensor_reading.no2,
        'SO2': sensor_reading.so2,
        'O3': sensor_reading.o3,
    }
    
    result = AQICalculator.calculate_full_aqi(sensor_data)
    result['timestamp'] = sensor_reading.timestamp
    
    return result