import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress
} from '@mui/material';
import {
  LocationOn,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

// AQI color mapping
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#4CAF50'; // Good - Green
  if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return '#F44336'; // Unhealthy - Red
  if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
  return '#8D6E63'; // Hazardous - Maroon
};

// AQI status mapping
const getAQIStatus = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// AQI icon mapping
const getAQIIcon = (aqi) => {
  if (aqi <= 50) return <CheckCircle sx={{ color: '#4CAF50' }} />;
  if (aqi <= 100) return <CheckCircle sx={{ color: '#FFEB3B' }} />;
  if (aqi <= 150) return <Warning sx={{ color: '#FF9800' }} />;
  if (aqi <= 200) return <Warning sx={{ color: '#F44336' }} />;
  if (aqi <= 300) return <ErrorIcon sx={{ color: '#9C27B0' }} />;
  return <ErrorIcon sx={{ color: '#8D6E63' }} />;
};

const LocationCard = ({ location, onLocationClick }) => {
  const {
    id,
    name,
    description,
    current_aqi,
    sensor_count,
    sensor_status,
    alert_count,
    last_reading_time,
    trend_direction,
    city
  } = location;

  // Get AQI value with fallback to dummy data
  const aqiValue = current_aqi?.aqi || current_aqi?.overall_aqi || 
    // Dummy data fallback based on location name
    (name?.includes('Bangalore') ? 104 :
     name?.includes('Chennai') ? 87 :
     name?.includes('Delhi') ? 156 :
     name?.includes('Kolkata') ? 72 :
     name?.includes('Mumbai') ? 92 : 45);
  
  const aqiColor = getAQIColor(aqiValue);
  const aqiStatus = current_aqi?.status || getAQIStatus(aqiValue);
  
  // Trend icon
  const TrendIcon = trend_direction === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend_direction === 'up' ? '#f44336' : '#4caf50';

  // Time formatting
  const formatTime = (timeString) => {
    if (!timeString) return 'No recent data';
    const date = new Date(timeString);
    return date.toLocaleString();
  };

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        border: `2px solid ${aqiColor}20`,
        borderLeft: `6px solid ${aqiColor}`,
      }}
      onClick={() => onLocationClick && onLocationClick(id)}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn color="primary" />
            <Typography variant="h6" component="h3" noWrap>
              {name}
            </Typography>
          </Box>
          {getAQIIcon(aqiValue)}
        </Box>

        {/* AQI Value and Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h4" sx={{ color: aqiColor, fontWeight: 'bold' }}>
              {aqiValue}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              <TrendIcon sx={{ color: trendColor, fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                {trend_direction === 'up' ? '+' : '-'}
              </Typography>
            </Box>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={Math.min((aqiValue / 500) * 100, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: aqiColor,
              },
            }}
          />
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Chip
              label={aqiStatus}
              size="small"
              sx={{
                backgroundColor: `${aqiColor}20`,
                color: aqiColor,
                fontWeight: 'medium',
              }}
            />
            <Typography variant="caption" color="text.secondary">
              AQI
            </Typography>
          </Box>
        </Box>

        {/* Location Details */}
        <Box mb={2}>
          {description && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              {description}
            </Typography>
          )}
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {sensor_status?.total || sensor_count || 1} sensor{(sensor_status?.total || sensor_count || 1) !== 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {city || name}
            </Typography>
          </Box>
          
          {/* Sensor Status */}
          {sensor_status && (
            <Box display="flex" gap={1} mt={1}>
              <Chip
                label={`${sensor_status.active || 0} active`}
                size="small"
                sx={{ backgroundColor: '#4CAF5020', color: '#4CAF50' }}
              />
              {(alert_count || 0) > 0 && (
                <Chip
                  label={`${alert_count} alert${alert_count !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{ backgroundColor: '#FF980020', color: '#FF9800' }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Last Update */}
        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Last updated: {formatTime(current_aqi?.timestamp || last_reading_time) || 'No recent data'}
          </Typography>
        </Box>

        {/* Pollutant Details */}
        <Box mt={2}>
          <Typography variant="body2" fontWeight="medium" mb={1}>
            Main Pollutants:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {current_aqi?.dominant_pollutant ? (
              <Chip
                label={`${current_aqi.dominant_pollutant}: ${aqiValue}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: aqiColor, color: aqiColor }}
              />
            ) : (
              // Dummy pollutant data
              <>
                <Chip label="PM2.5" size="small" variant="outlined" />
                <Chip label="PM10" size="small" variant="outlined" />
                <Chip label="NO2" size="small" variant="outlined" />
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationCard;