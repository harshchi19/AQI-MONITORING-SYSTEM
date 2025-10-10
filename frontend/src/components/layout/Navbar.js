import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../../store/dashboardSlice';
import { fetchActiveAlerts } from '../../store/alertsSlice';

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector(state => state.alerts);
  const { lastUpdated, isLoading } = useSelector(state => state.dashboard);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
    dispatch(fetchActiveAlerts());
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Menu button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          AQI Monitoring System
        </Typography>

        {/* Status indicators */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Connection status */}
          <Tooltip title={isOnline ? 'Online' : 'Offline'}>
            <Chip
              icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Tooltip>

          {/* Last updated */}
          <Typography variant="caption" color="text.secondary">
            Last updated: {formatLastUpdated(lastUpdated)}
          </Typography>

          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton
              color="inherit"
              onClick={handleRefresh}
              disabled={isLoading}
              sx={{
                animation: isLoading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Alerts">
            {/* <IconButton color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;