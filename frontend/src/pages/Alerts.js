import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  FilterList as FilterIcon,
  MarkAsUnread,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

// Alert severity mapping
const alertIcons = {
  'critical': <ErrorIcon sx={{ color: '#f44336' }} />,
  'high': <WarningIcon sx={{ color: '#ff9800' }} />,
  'medium': <InfoIcon sx={{ color: '#2196f3' }} />,
  'low': <SuccessIcon sx={{ color: '#4caf50' }} />
};

const alertColors = {
  'critical': '#f44336',
  'high': '#ff9800',
  'medium': '#2196f3',
  'low': '#4caf50'
};

const getAlertSeverityFromAQI = (aqi) => {
  if (aqi >= 300) return 'critical';
  if (aqi >= 200) return 'high';
  if (aqi >= 150) return 'medium';
  return 'low';
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now - alertTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const AlertItem = ({ alert, onDismiss, onAcknowledge }) => {
  const {
    id,
    message,
    severity,
    location_name,
    aqi_value,
    pollutant,
    timestamp,
    is_acknowledged,
    details
  } = alert;

  const alertSeverity = severity || getAlertSeverityFromAQI(aqi_value);
  const icon = alertIcons[alertSeverity];
  const color = alertColors[alertSeverity];

  return (
    <ListItem
      sx={{
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 2,
        mb: 2,
        backgroundColor: is_acknowledged ? 'rgba(0,0,0,0.02)' : 'background.paper',
        opacity: is_acknowledged ? 0.7 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${color}40`,
          backgroundColor: is_acknowledged ? 'rgba(0,0,0,0.04)' : `${color}05`
        }
      }}
    >
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1}>
              <Typography variant="body1" sx={{ fontWeight: is_acknowledged ? 'normal' : 'medium' }}>
                {message}
              </Typography>
              {location_name && (
                <Chip size="small" label={location_name} variant="outlined" />
              )}
              {aqi_value && (
                <Chip
                  size="small"
                  label={`AQI: ${aqi_value}`}
                  sx={{
                    backgroundColor: `${color}20`,
                    color: color
                  }}
                />
              )}
            </Box>
            
            {details && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {details}
              </Typography>
            )}
          </Box>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {formatTimeAgo(timestamp)}
            {pollutant && ` • ${pollutant.toUpperCase()}`}
            {is_acknowledged && ' • Acknowledged'}
          </Typography>
        }
      />
      
      <Box display="flex" alignItems="center" gap={1}>
        {!is_acknowledged && (
          <Tooltip title="Mark as acknowledged">
            <IconButton size="small" onClick={() => onAcknowledge(id)}>
              <MarkAsUnread />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Dismiss alert">
          <IconButton size="small" color="error" onClick={() => onDismiss(id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </ListItem>
  );
};

const AlertSettings = ({ open, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    critical_threshold: 300,
    high_threshold: 200,
    medium_threshold: 150,
    low_threshold: 100,
    notification_frequency: 'immediate',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    auto_acknowledge: false,
    alert_retention_days: 30,
    location_filters: []
  });

  useEffect(() => {
    if (settings && open) {
      setFormData({ ...settings });
    }
  }, [settings, open]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Alert Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.email_notifications}
                  onChange={handleChange('email_notifications')}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.sms_notifications}
                  onChange={handleChange('sms_notifications')}
                />
              }
              label="SMS Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.push_notifications}
                  onChange={handleChange('push_notifications')}
                />
              }
              label="Push Notifications"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Alert Thresholds (AQI)
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Critical Threshold"
              value={formData.critical_threshold}
              onChange={handleChange('critical_threshold')}
              helperText="AQI value for critical alerts"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="High Threshold"
              value={formData.high_threshold}
              onChange={handleChange('high_threshold')}
              helperText="AQI value for high alerts"
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Medium Threshold"
              value={formData.medium_threshold}
              onChange={handleChange('medium_threshold')}
              helperText="AQI value for medium alerts"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="number"
              label="Low Threshold"
              value={formData.low_threshold}
              onChange={handleChange('low_threshold')}
              helperText="AQI value for low alerts"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Notification Frequency</InputLabel>
              <Select
                value={formData.notification_frequency}
                onChange={handleChange('notification_frequency')}
                label="Notification Frequency"
              >
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="every_5_min">Every 5 Minutes</MenuItem>
                <MenuItem value="every_15_min">Every 15 Minutes</MenuItem>
                <MenuItem value="hourly">Hourly Digest</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="number"
              label="Retention (Days)"
              value={formData.alert_retention_days}
              onChange={handleChange('alert_retention_days')}
              helperText="Auto-delete alerts after"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.auto_acknowledge}
                  onChange={handleChange('auto_acknowledge')}
                />
              }
              label="Auto Acknowledge Low Priority Alerts"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Quiet Hours
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.quiet_hours_enabled}
                  onChange={handleChange('quiet_hours_enabled')}
                />
              }
              label="Enable Quiet Hours"
            />
          </Grid>

          {formData.quiet_hours_enabled && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Quiet Hours Start"
                  value={formData.quiet_hours_start}
                  onChange={handleChange('quiet_hours_start')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Quiet Hours End"
                  value={formData.quiet_hours_end}
                  onChange={handleChange('quiet_hours_end')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Alerts = () => {
  const { error, settings } = useSelector(state => state.alerts || {});
  
  const [filter, setFilter] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Generate comprehensive dummy data
  const generateDummyAlerts = () => {
    const locations = [
      'Mumbai Central', 'Delhi North', 'Bangalore East', 'Chennai South', 
      'Kolkata West', 'Hyderabad Tech City', 'Pune Downtown', 'Ahmedabad Industrial'
    ];
    
    const pollutants = ['PM2.5', 'PM10', 'NO2', 'O3', 'SO2', 'CO'];
    
    const alertMessages = [
      'Air quality has exceeded safe limits',
      'Pollutant spike detected in monitoring area',
      'Health advisory issued for sensitive groups',
      'Emergency air quality alert triggered',
      'Sensor maintenance required - quality check failed',
      'Weather conditions affecting air quality readings',
      'Industrial emissions detected above normal levels',
      'Traffic pollution causing AQI increase'
    ];

    const dummyAlerts = [];
    const now = new Date();

    // Generate alerts with different severities and times
    for (let i = 0; i < 25; i++) {
      const randomHours = Math.floor(Math.random() * 72); // Last 3 days
      const alertTime = new Date(now - (randomHours * 60 * 60 * 1000));
      const aqi = Math.floor(Math.random() * 400) + 50; // AQI between 50-450
      const location = locations[Math.floor(Math.random() * locations.length)];
      const pollutant = pollutants[Math.floor(Math.random() * pollutants.length)];
      const message = alertMessages[Math.floor(Math.random() * alertMessages.length)];
      
      let severity;
      if (aqi >= 300) severity = 'critical';
      else if (aqi >= 200) severity = 'high';
      else if (aqi >= 150) severity = 'medium';
      else severity = 'low';

      const details = `${pollutant} levels have reached ${aqi} μg/m³. Current weather conditions: ${Math.floor(Math.random() * 15) + 20}°C, ${Math.floor(Math.random() * 40) + 40}% humidity, ${Math.floor(Math.random() * 15) + 5} km/h wind speed.`;

      dummyAlerts.push({
        id: `alert_${i + 1}`,
        message,
        severity,
        location_name: location,
        aqi_value: aqi,
        pollutant,
        timestamp: alertTime.toISOString(),
        is_acknowledged: Math.random() > 0.7, // 30% acknowledged
        details,
        created_by: 'System',
        sensor_id: `sensor_${Math.floor(Math.random() * 50) + 1}`
      });
    }

    // Sort by timestamp (newest first)
    return dummyAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  useEffect(() => {
    // Simulate loading and generate dummy data
    setLoading(true);
    setTimeout(() => {
      const dummyData = generateDummyAlerts();
      setAlerts(dummyData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const newDummyData = generateDummyAlerts();
      setAlerts(newDummyData);
      setLoading(false);
    }, 800);
  };

  const handleDismissAlert = async (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  const handleAcknowledgeAlert = async (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_acknowledged: true }
          : alert
      )
    );
  };

  const handleSaveSettings = async (newSettings) => {
    console.log('Saving alert settings:', newSettings);
    // Simulate API call
    setTimeout(() => {
      alert('Settings saved successfully!');
    }, 500);
  };

  // Filter alerts with null check
  const safeAlerts = alerts || [];
  const filteredAlerts = safeAlerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !alert.is_acknowledged;
    if (filter === 'critical') return (alert.severity === 'critical' || alert.aqi_value >= 300);
    return alert.severity === filter;
  });

  // Statistics
  const stats = safeAlerts.reduce((acc, alert) => {
    const severity = alert.severity || getAlertSeverityFromAQI(alert.aqi_value);
    acc[severity] = (acc[severity] || 0) + 1;
    if (!alert.is_acknowledged) acc.unacknowledged = (acc.unacknowledged || 0) + 1;
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <WarningIcon sx={{ color: '#667eea', fontSize: 40 }} />
            Alert Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage air quality alerts
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Tooltip title="Configure alert settings">
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a67d8',
                  backgroundColor: '#667eea20'
                }
              }}
            >
              Settings
            </Button>
          </Tooltip>
          <Tooltip title="Refresh alerts data">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6c5b7b 100%)'
                }
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                {safeAlerts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(244, 67, 54, 0.3)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.critical || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Critical
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(255, 152, 0, 0.3)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.high || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                High
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stats.medium || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Medium
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={stats.unacknowledged || 0} color="error">
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.unacknowledged || 0}
                </Typography>
              </Badge>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Unread
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <FilterIcon />
            <Typography variant="body1">Filter:</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Alerts</MenuItem>
                <MenuItem value="unacknowledged">Unacknowledged</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAlerts.length} of {safeAlerts.length} alerts
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading alerts...</Typography>
            </Box>
          ) : filteredAlerts.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredAlerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismissAlert}
                  onAcknowledge={handleAcknowledgeAlert}
                />
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={6}>
              <SuccessIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Alerts Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filter === 'all' 
                  ? 'No alerts have been generated yet'
                  : `No ${filter} alerts found`
                }
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <AlertSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </Container>
  );
};

export default Alerts;