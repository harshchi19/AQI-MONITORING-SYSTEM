import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  LocationOn,
  Speed,
  Visibility,
  Air
} from '@mui/icons-material';

// AQI color mapping
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#4CAF50';
  if (aqi <= 100) return '#FFEB3B';
  if (aqi <= 150) return '#FF9800';
  if (aqi <= 200) return '#F44336';
  if (aqi <= 300) return '#9C27B0';
  return '#8D6E63';
};

const StatCard = ({ title, value, icon, color = 'primary', trend = null, unit = '' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
            {value}{unit}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              {trend > 0 ? (
                <TrendingUp sx={{ color: '#f44336', fontSize: 16 }} />
              ) : (
                <TrendingDown sx={{ color: '#4caf50', fontSize: 16 }} />
              )}
              <Typography variant="caption" color="text.secondary" ml={0.5}>
                {Math.abs(trend)}% from yesterday
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.light`, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const OverviewStats = ({ data, loading = false }) => {
  if (loading) {
    return (
      <Card sx={{ height: 200 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  // Use real data if available, otherwise use dummy data
  const {
    total_locations = data?.total_locations || 5,
    active_sensors = data?.active_sensors || 5,
    average_aqi = data?.average_aqi || 92,
    unhealthy_locations = data?.unhealthy_locations || 2,
    last_update = data?.last_update || new Date().toISOString(),
    trends = data?.trends || { aqi: -5.2, sensors: 0 }
  } = data || {};

  const aqiColor = getAQIColor(average_aqi);

  const stats = [
    {
      title: 'Total Locations',
      value: total_locations,
      icon: <LocationOn />,
      color: 'primary',
      trend: trends.locations
    },
    {
      title: 'Active Sensors',
      value: active_sensors,
      icon: <Speed />,
      color: 'secondary',
      trend: trends.sensors
    },
    {
      title: 'Average AQI',
      value: average_aqi,
      icon: <Air />,
      color: aqiColor,
      trend: trends.aqi
    },
    {
      title: 'Unhealthy Areas',
      value: unhealthy_locations,
      icon: <Visibility />,
      color: 'error',
      trend: trends.unhealthy
    }
  ];

  return (
    <Card>
      <CardContent>
        <Box mb={3}>
          <Typography variant="h6" component="h2" gutterBottom>
            System Overview
          </Typography>
          {last_update && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(last_update).toLocaleString()}
            </Typography>
          )}
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Additional Summary */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Air Quality Summary
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={`Avg AQI: ${average_aqi}`}
              sx={{
                backgroundColor: `${aqiColor}20`,
                color: aqiColor,
                fontWeight: 'medium'
              }}
            />
            {unhealthy_locations > 0 && (
              <Chip
                label={`${unhealthy_locations} area${unhealthy_locations > 1 ? 's' : ''} need attention`}
                color="warning"
                variant="outlined"
              />
            )}
            {active_sensors > 0 && (
              <Chip
                label={`${active_sensors} sensors online`}
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Status Indicators */}
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            System Status
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: active_sensors > 0 ? '#4caf50' : '#f44336'
                }}
              />
              <Typography variant="body2">
                Data Collection: {active_sensors > 0 ? 'Active' : 'Inactive'}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: last_update ? '#4caf50' : '#ff9800'
                }}
              />
              <Typography variant="body2">
                Real-time Updates: {last_update ? 'Connected' : 'Reconnecting'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OverviewStats;