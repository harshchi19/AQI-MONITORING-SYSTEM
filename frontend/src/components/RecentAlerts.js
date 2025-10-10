import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  IconButton,
  Badge,
  Button,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore,
  ExpandLess,
  Notifications,
  NotificationsOff,
  Clear,
  Refresh
} from '@mui/icons-material';

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

const AlertItem = ({ alert, onDismiss, onExpand, expanded }) => {
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
        borderRadius: 1,
        mb: 1,
        backgroundColor: is_acknowledged ? 'rgba(0,0,0,0.02)' : 'background.paper',
        opacity: is_acknowledged ? 0.7 : 1
      }}
    >
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
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
        }
        secondary={
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(timestamp)}
              {pollutant && ` • ${pollutant.toUpperCase()}`}
              {is_acknowledged && ' • Acknowledged'}
            </Typography>
            
            {details && expanded && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {details}
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
      
      <Box display="flex" alignItems="center" gap={1}>
        {details && (
          <IconButton size="small" onClick={() => onExpand(id)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
        
        {!is_acknowledged && (
          <IconButton size="small" onClick={() => onDismiss(id)}>
            <Clear />
          </IconButton>
        )}
      </Box>
    </ListItem>
  );
};

const RecentAlerts = ({ 
  alerts = [], 
  maxItems = 5, 
  onDismissAlert, 
  onRefresh,
  showNotificationToggle = true,
  loading = false 
}) => {
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filter and sort alerts with null check
  const safeAlerts = alerts || [];
  const sortedAlerts = safeAlerts
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, maxItems);

  const unacknowledgedCount = safeAlerts.filter(alert => !alert.is_acknowledged).length;
  const criticalCount = safeAlerts.filter(alert => 
    (alert.severity === 'critical' || alert.aqi_value >= 300) && !alert.is_acknowledged
  ).length;

  const handleExpandAlert = (alertId) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const handleDismissAlert = async (alertId) => {
    try {
      if (onDismissAlert) {
        await onDismissAlert(alertId);
        setSnackbar({
          open: true,
          message: 'Alert dismissed successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to dismiss alert',
        severity: 'error'
      });
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    setSnackbar({
      open: true,
      message: `Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`,
      severity: 'info'
    });
  };

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6">Recent Alerts</Typography>
              {unacknowledgedCount > 0 && (
                <Badge badgeContent={unacknowledgedCount} color="error">
                  <WarningIcon />
                </Badge>
              )}
            </Box>
          }
          action={
            <Box display="flex" alignItems="center" gap={1}>
              {showNotificationToggle && (
                <IconButton onClick={toggleNotifications} title="Toggle notifications">
                  {notificationsEnabled ? <Notifications /> : <NotificationsOff />}
                </IconButton>
              )}
              <IconButton onClick={onRefresh} disabled={loading} title="Refresh alerts">
                <Refresh />
              </IconButton>
            </Box>
          }
        />
        
        <CardContent sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          {criticalCount > 0 && (
            <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
              {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} require immediate attention!
            </Alert>
          )}

          <Box 
            sx={{ 
              flex: 1, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sortedAlerts.length === 0 ? (
              <Box textAlign="center" py={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <SuccessIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No recent alerts
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Air quality is within acceptable ranges
                </Typography>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}
              >
                <List sx={{ p: 0 }}>
                  {sortedAlerts.map((alert, index) => (
                    <div key={alert.id}>
                      <AlertItem
                        alert={alert}
                        onDismiss={handleDismissAlert}
                        onExpand={handleExpandAlert}
                        expanded={expandedAlerts.has(alert.id)}
                      />
                      {index < sortedAlerts.length - 1 && <Divider sx={{ my: 1 }} />}
                    </div>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2, flexShrink: 0 }}>
            {alerts.length > maxItems && (
              <Box textAlign="center" mb={1}>
                <Button variant="outlined" size="small">
                  View All Alerts ({alerts.length})
                </Button>
              </Box>
            )}

            {sortedAlerts.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                Showing {Math.min(maxItems, alerts.length)} of {alerts.length} alerts
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RecentAlerts;