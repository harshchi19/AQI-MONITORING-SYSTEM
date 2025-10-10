import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from '@mui/material';
import {
  Notifications,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, fetchAnalytics } from '../store/dashboardSlice';
import { fetchActiveAlerts } from '../store/alertsSlice';

// Component imports
import LocationCard from '../components/LocationCard';
import OverviewStats from '../components/OverviewStats';
import RecentAlerts from '../components/RecentAlerts';
import AQITrendChart from '../components/AQITrendChart';
import PollutantChart from '../components/PollutantChart';

// Generate dummy alerts data
const generateDummyAlerts = () => [
  {
    id: 1,
    message: "High PM2.5 levels detected",
    severity: "high",
    location_name: "Delhi_North",
    aqi_value: 124,
    pollutant: "PM2.5",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    is_acknowledged: false,
    details: "PM2.5 concentration has exceeded safe limits. Sensitive individuals should limit outdoor exposure."
  },
  {
    id: 2,
    message: "Air quality deteriorating",
    severity: "medium",
    location_name: "Kolkata_West",
    aqi_value: 103,
    pollutant: "PM10",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    is_acknowledged: false,
    details: "Air quality has moved to unhealthy range for sensitive groups."
  },
  {
    id: 3,
    message: "Ozone levels elevated",
    severity: "medium",
    location_name: "Chennai_South",
    aqi_value: 89,
    pollutant: "O3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_acknowledged: true,
    details: "Ground-level ozone concentrations are higher than normal due to sunlight and heat."
  },
  {
    id: 4,
    message: "Sensor connectivity restored",
    severity: "low",
    location_name: "Mumbai_Central",
    aqi_value: 85,
    pollutant: null,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    is_acknowledged: true,
    details: "Sensor network has been restored and is now collecting real-time data."
  },
  {
    id: 5,
    message: "Air quality improving",
    severity: "low",
    location_name: "Bangalore_East",
    aqi_value: 78,
    pollutant: "PM2.5",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    is_acknowledged: false,
    details: "Air quality conditions have improved due to favorable wind patterns."
  }
];

// Generate comprehensive dummy location data
const generateDummyLocations = () => [
  {
    id: '1',
    name: 'Bangalore_East',
    city: 'Bangalore',
    current_aqi: {
      aqi: 78,
      status: 'Moderate',
      dominant_pollutant: 'PM2.5',
      timestamp: new Date().toISOString()
    },
    sensor_count: 1,
    sensor_status: 'active',
    alert_count: 0,
    last_reading_time: '2025-10-10T17:00:00Z',
    trend_direction: 'down',
    pollutants: {
      'PM2.5': 78.1,
      'PM10': 85.2,
      'NO2': 42.3,
      'O3': 67.8,
      'SO2': 23.1,
      'CO': 1.2
    }
  },
  {
    id: '2',
    name: 'Chennai_South',
    city: 'Chennai',
    current_aqi: {
      aqi: 89,
      status: 'Moderate',
      dominant_pollutant: 'PM2.5',
      timestamp: new Date().toISOString()
    },
    sensor_count: 1,
    sensor_status: 'active',
    alert_count: 0,
    last_reading_time: '2025-10-10T17:00:00Z',
    trend_direction: 'down',
    pollutants: {
      'PM2.5': 89.7,
      'PM10': 95.3,
      'NO2': 38.9,
      'O3': 72.1,
      'SO2': 19.8,
      'CO': 1.1
    }
  },
  {
    id: '3',
    name: 'Delhi_North',
    city: 'Delhi',
    current_aqi: {
      aqi: 124,
      status: 'Unhealthy for Sensitive Groups',
      dominant_pollutant: 'PM2.5',
      timestamp: new Date().toISOString()
    },
    sensor_count: 1,
    sensor_status: 'active',
    alert_count: 1,
    last_reading_time: '2025-10-10T17:00:00Z',
    trend_direction: 'up',
    pollutants: {
      'PM2.5': 124.8,
      'PM10': 142.5,
      'NO2': 67.2,
      'O3': 89.4,
      'SO2': 31.7,
      'CO': 2.1
    }
  },
  {
    id: '4',
    name: 'Kolkata_West',
    city: 'Kolkata',
    current_aqi: {
      aqi: 103,
      status: 'Unhealthy for Sensitive Groups',
      dominant_pollutant: 'PM2.5',
      timestamp: new Date().toISOString()
    },
    sensor_count: 1,
    sensor_status: 'active',
    alert_count: 1,
    last_reading_time: '2025-10-10T17:00:00Z',
    trend_direction: 'up',
    pollutants: {
      'PM2.5': 103.6,
      'PM10': 118.9,
      'NO2': 58.4,
      'O3': 76.3,
      'SO2': 27.2,
      'CO': 1.8
    }
  },
  {
    id: '5',
    name: 'Mumbai_Central',
    city: 'Mumbai',
    current_aqi: {
      aqi: 85,
      status: 'Moderate',
      dominant_pollutant: 'PM2.5',
      timestamp: new Date().toISOString()
    },
    sensor_count: 1,
    sensor_status: 'active',
    alert_count: 0,
    last_reading_time: '2025-10-10T17:00:00Z',
    trend_direction: 'stable',
    pollutants: {
      'PM2.5': 85.5,
      'PM10': 92.1,
      'NO2': 44.7,
      'O3': 69.2,
      'SO2': 21.6,
      'CO': 1.3
    }
  }
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { locations, analytics, isLoading, error } = useSelector(state => state.dashboard);
  const { activeAlerts } = useSelector(state => state.alerts);
  
  // State for notification dialog
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  // Get dummy alerts data
  const dummyAlerts = generateDummyAlerts();
  const displayAlerts = activeAlerts && activeAlerts.length > 0 ? activeAlerts : dummyAlerts;

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchDashboardData());
    dispatch(fetchAnalytics({ hours: 24 }));
    dispatch(fetchActiveAlerts());

    // Set up periodic refresh
    const interval = setInterval(() => {
      dispatch(fetchDashboardData());
      dispatch(fetchActiveAlerts());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  if (isLoading && locations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading dashboard data: {error.message || error}
        </Alert>
      </Container>
    );
  }

  // Use dummy data if locations is empty
  const displayLocations = locations && locations.length > 0 ? locations : generateDummyLocations();
  
  // Generate comprehensive dummy analytics if not available
  const dummyAnalytics = analytics || {
    totalLocations: displayLocations.length,
    avgAqi: Math.round(displayLocations.reduce((sum, loc) => sum + loc.current_aqi.aqi, 0) / displayLocations.length),
    activeSensors: displayLocations.reduce((sum, loc) => sum + loc.sensor_count, 0),
    activeAlerts: displayLocations.reduce((sum, loc) => sum + loc.alert_count, 0),
    unhealthyAreas: displayLocations.filter(loc => loc.current_aqi.aqi > 100).length,
    airQualityTrend: 'improving',
    systemStatus: 'operational',
    dataCollectionStatus: 'active',
    lastUpdate: new Date().toISOString(),
    yesterdayChange: 5.2, // percentage change from yesterday
    weeklyTrend: 'stable',
    criticalAlerts: displayLocations.filter(loc => loc.current_aqi.aqi > 200).length,
    moderateAreas: displayLocations.filter(loc => loc.current_aqi.aqi >= 51 && loc.current_aqi.aqi <= 100).length,
    goodAreas: displayLocations.filter(loc => loc.current_aqi.aqi <= 50).length
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Enhanced Page Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Air Quality Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Real-time monitoring of air quality across all locations
            </Typography>
          </Box>
          
          {/* Notification Bell */}
          <IconButton
            onClick={() => setNotificationDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(102, 126, 234, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.2)',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Badge 
              badgeContent={displayAlerts.filter(alert => !alert.is_acknowledged).length} 
              color="error"
              max={99}
            >
              <Notifications sx={{ color: '#667eea' }} />
            </Badge>
          </IconButton>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          flexWrap: 'wrap',
          p: 2,
          bgcolor: 'rgba(102, 126, 234, 0.05)',
          borderRadius: 2,
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <Typography variant="body2" color="text.secondary">
            <strong>System Overview</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            bgcolor: 'success.light',
            px: 2,
            py: 0.5,
            borderRadius: 1
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              bgcolor: 'success.main', 
              borderRadius: '50%' 
            }} />
            <Typography variant="body2" color="success.dark">
              AQI 166.96
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            2 areas need attention
          </Typography>
          <Typography variant="body2" color="text.secondary">
            5 sensors online
          </Typography>
        </Box>
      </Box>

      {/* Enhanced Overview Statistics */}
      <Box mb={4}>
        <OverviewStats analytics={dummyAnalytics} />
      </Box>

      {/* Air Quality Summary Cards */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: 'text.primary' }}>
          Air Quality Summary
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>AQI 166.96</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>2 areas need attention</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>5 sensors online</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Real-time Updates: Connected</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Data Collection</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Active</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
              color: 'white',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>System Status</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>All Systems Operational</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Location Cards Grid */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: 'text.primary' }}>
          Location Overview
        </Typography>
        <Grid container spacing={3}>
          {displayLocations.map((location) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={location.id}>
              <LocationCard location={location} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* AQI Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card elevation={3} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: 'text.primary' }}>
                📈 24-Hour AQI Trends
              </Typography>
              <Box height={400}>
                <AQITrendChart locations={displayLocations} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ 
            height: '100%',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: 'text.primary' }}>
                🚨 Recent Alerts
              </Typography>
              <RecentAlerts alerts={displayAlerts.slice(0, 10)} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pollutant Analysis */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={3} sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" sx={{ color: 'text.primary' }}>
                🧪 Pollutant Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current Pollutant Levels across all monitoring stations
              </Typography>
              <Box height={350}>
                <PollutantChart locations={displayLocations} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Notifications color="primary" />
            <Typography variant="h6" component="div">
              Alert Notifications
            </Typography>
            <Badge 
              badgeContent={displayAlerts.filter(alert => !alert.is_acknowledged).length} 
              color="error" 
              sx={{ ml: 1 }}
            >
              <Box />
            </Badge>
          </Box>
          <IconButton onClick={() => setNotificationDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {displayAlerts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <SuccessIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No active alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All systems are operating normally
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {displayAlerts.map((alert, index) => {
                const alertIcon = 
                  alert.severity === 'critical' ? <ErrorIcon sx={{ color: '#f44336' }} /> :
                  alert.severity === 'high' ? <WarningIcon sx={{ color: '#ff9800' }} /> :
                  alert.severity === 'medium' ? <InfoIcon sx={{ color: '#2196f3' }} /> :
                  <SuccessIcon sx={{ color: '#4caf50' }} />;

                const alertColor = 
                  alert.severity === 'critical' ? '#f44336' :
                  alert.severity === 'high' ? '#ff9800' :
                  alert.severity === 'medium' ? '#2196f3' :
                  '#4caf50';

                const timeAgo = () => {
                  const now = new Date();
                  const alertTime = new Date(alert.timestamp);
                  const diffMs = now - alertTime;
                  const diffMins = Math.floor(diffMs / (1000 * 60));
                  const diffHours = Math.floor(diffMins / 60);
                  
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  return `${diffHours}h ago`;
                };

                return (
                  <React.Fragment key={alert.id}>
                    <ListItem
                      sx={{
                        border: `1px solid ${alertColor}30`,
                        borderLeft: `4px solid ${alertColor}`,
                        borderRadius: 1,
                        mb: 1,
                        backgroundColor: alert.is_acknowledged ? 'rgba(0,0,0,0.02)' : 'background.paper',
                        opacity: alert.is_acknowledged ? 0.7 : 1
                      }}
                    >
                      <ListItemIcon>
                        {alertIcon}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            <Typography variant="body1" sx={{ fontWeight: alert.is_acknowledged ? 'normal' : 'medium' }}>
                              {alert.message}
                            </Typography>
                            {alert.location_name && (
                              <Chip size="small" label={alert.location_name} variant="outlined" />
                            )}
                            {alert.aqi_value && (
                              <Chip
                                size="small"
                                label={`AQI: ${alert.aqi_value}`}
                                sx={{
                                  backgroundColor: `${alertColor}20`,
                                  color: alertColor
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              {timeAgo()}
                              {alert.pollutant && ` • ${alert.pollutant.toUpperCase()}`}
                              {alert.is_acknowledged && ' • Acknowledged'}
                            </Typography>
                            
                            {alert.details && (
                              <Box mt={1}>
                                <Typography variant="body2" color="text.secondary">
                                  {alert.details}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < displayAlerts.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setNotificationDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              // Handle mark all as read
              setNotificationDialogOpen(false);
            }}
            variant="contained"
            disabled={displayAlerts.filter(alert => !alert.is_acknowledged).length === 0}
          >
            Mark All as Read
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;