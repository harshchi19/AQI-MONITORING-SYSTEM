import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn,
  Sensors as SensorsIcon,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  Battery4Bar as BatteryIcon,
  SignalCellular4Bar as SignalIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSensors } from '../store/sensorsSlice';

const sensorTypes = ['PM2.5', 'PM10', 'CO', 'NO2', 'SO2', 'O3'];
const sensorStatuses = ['active', 'inactive', 'maintenance', 'error'];

const statusColors = {
  active: '#4caf50',
  inactive: '#9e9e9e',
  maintenance: '#ff9800',
  error: '#f44336'
};

const statusIcons = {
  active: <CheckCircle />,
  inactive: <ErrorIcon />,
  maintenance: <WarningIcon />,
  error: <ErrorIcon />
};

const SensorCard = ({ sensor, onEdit, onDelete, onViewDetails, onCalibrate }) => {
  const { 
    name, sensor_type, status, location_name, last_reading, calibration_date,
    battery_level, signal_strength, reading_value, reading_unit, alerts_count, uptime
  } = sensor;
  
  const statusColor = statusColors[status] || '#9e9e9e';
  const StatusIcon = statusIcons[status];

  const getBatteryColor = (level) => {
    if (level > 70) return '#4caf50';
    if (level > 30) return '#ff9800';
    return '#f44336';
  };

  const getSignalColor = (strength) => {
    if (strength > 80) return '#4caf50';
    if (strength > 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card sx={{ 
      height: '100%', 
      border: `2px solid ${statusColor}20`, 
      borderLeft: `6px solid ${statusColor}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        borderColor: statusColor
      }
    }}>
      <CardContent>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
              {name}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <SensorsIcon fontSize="small" sx={{ color: '#3498db' }} />
              <Chip 
                label={sensor_type} 
                size="small" 
                sx={{ 
                  backgroundColor: '#e3f2fd', 
                  color: '#1976d2',
                  fontWeight: 'medium',
                  fontSize: '0.75rem'
                }} 
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                {location_name}
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ 
            bgcolor: statusColor, 
            width: 45, 
            height: 45,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {StatusIcon}
          </Avatar>
        </Box>

        {/* Current Reading */}
        {reading_value > 0 && (
          <Box mb={2} p={1.5} sx={{ 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 2,
            border: '1px solid #dee2e6'
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Reading
            </Typography>
            <Typography variant="h5" sx={{ 
              fontWeight: 'bold', 
              color: statusColor,
              display: 'flex',
              alignItems: 'baseline',
              gap: 0.5
            }}>
              {reading_value}
              <Typography variant="body2" component="span" color="text.secondary">
                {reading_unit}
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Status and Metrics */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Chip
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              size="small"
              sx={{
                backgroundColor: `${statusColor}20`,
                color: statusColor,
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />
            {alerts_count > 0 && (
              <Chip
                icon={<NotificationsIcon />}
                label={`${alerts_count} alerts`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>

          {/* Battery and Signal */}
          <Box display="flex" gap={2} mb={1}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <BatteryIcon sx={{ fontSize: 16, color: getBatteryColor(battery_level) }} />
              <Typography variant="caption" sx={{ color: getBatteryColor(battery_level), fontWeight: 'medium' }}>
                {battery_level}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <SignalIcon sx={{ fontSize: 16, color: getSignalColor(signal_strength) }} />
              <Typography variant="caption" sx={{ color: getSignalColor(signal_strength), fontWeight: 'medium' }}>
                {signal_strength}%
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <SpeedIcon sx={{ fontSize: 16, color: '#2196f3' }} />
              <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 'medium' }}>
                {uptime}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Timestamps */}
        <Box mb={2} sx={{ 
          backgroundColor: '#f8f9fa', 
          padding: 1, 
          borderRadius: 1,
          border: '1px solid #e9ecef'
        }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Last Reading: {last_reading ? new Date(last_reading).toLocaleString() : 'No data'}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Calibrated: {calibration_date ? new Date(calibration_date).toLocaleDateString() : 'Never'}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" gap={0.5} flexWrap="wrap">
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => onViewDetails(sensor)}
              sx={{ 
                backgroundColor: '#e3f2fd', 
                color: '#1976d2',
                '&:hover': { backgroundColor: '#bbdefb' }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Sensor">
            <IconButton 
              size="small" 
              onClick={() => onEdit(sensor)}
              sx={{ 
                backgroundColor: '#fff3e0', 
                color: '#f57c00',
                '&:hover': { backgroundColor: '#ffe0b2' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Calibrate">
            <IconButton 
              size="small" 
              onClick={() => onCalibrate(sensor)}
              sx={{ 
                backgroundColor: '#e8f5e8', 
                color: '#2e7d32',
                '&:hover': { backgroundColor: '#c8e6c9' }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onDelete(sensor)}
              sx={{ 
                backgroundColor: '#ffebee', 
                color: '#d32f2f',
                '&:hover': { backgroundColor: '#ffcdd2' }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

const SensorDialog = ({ open, onClose, sensor, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    sensor_type: '',
    status: 'active',
    location: '',
    description: ''
  });

  useEffect(() => {
    if (sensor) {
      setFormData({
        name: sensor.name || '',
        sensor_type: sensor.sensor_type || '',
        status: sensor.status || 'active',
        location: sensor.location || '',
        description: sensor.description || ''
      });
    } else {
      setFormData({
        name: '',
        sensor_type: '',
        status: 'active',
        location: '',
        description: ''
      });
    }
  }, [sensor, open]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {sensor ? 'Edit Sensor' : 'Add New Sensor'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sensor Name"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Sensor Type</InputLabel>
              <Select
                value={formData.sensor_type}
                onChange={handleChange('sensor_type')}
                label="Sensor Type"
              >
                {sensorTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleChange('status')}
                label="Status"
              >
                {sensorStatuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleChange('location')}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {sensor ? 'Update' : 'Add'} Sensor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Sensors = () => {
  const dispatch = useDispatch();
  const { isLoading: loading, error } = useSelector(state => state.sensors);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [sensorForDetails, setSensorForDetails] = useState(null);
  const [calibrateDialogOpen, setCalibrateDialogOpen] = useState(false);
  const [sensorToCalibrate, setSensorToCalibrate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Enhanced dummy sensor data with more details
  const dummySensors = [
    {
      id: 1,
      name: 'PM2.5 Sensor - Mumbai Central',
      sensor_type: 'PM2.5',
      status: 'active',
      location_name: 'Mumbai Central',
      last_reading: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      calibration_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      description: 'High-precision PM2.5 monitoring sensor',
      battery_level: 85,
      signal_strength: 92,
      firmware_version: 'v2.1.3',
      installation_date: new Date('2023-08-15'),
      last_maintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      reading_value: 42.5,
      reading_unit: 'µg/m³',
      coordinates: { lat: 19.0176, lng: 72.8562 },
      alerts_count: 3,
      uptime: 99.2
    },
    {
      id: 2,
      name: 'Multi-Sensor Delhi North',
      sensor_type: 'PM10',
      status: 'active',
      location_name: 'Delhi North',
      last_reading: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      calibration_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      description: 'Advanced multi-pollutant monitoring station',
      battery_level: 92,
      signal_strength: 87,
      firmware_version: 'v2.2.1',
      installation_date: new Date('2023-09-20'),
      last_maintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      reading_value: 78.3,
      reading_unit: 'µg/m³',
      coordinates: { lat: 28.7041, lng: 77.1025 },
      alerts_count: 1,
      uptime: 98.7
    },
    {
      id: 3,
      name: 'Smart Air Quality Monitor',
      sensor_type: 'CO',
      status: 'maintenance',
      location_name: 'Bangalore East',
      last_reading: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      calibration_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
      description: 'IoT-enabled carbon monoxide sensor with AI analytics',
      battery_level: 67,
      signal_strength: 78,
      firmware_version: 'v1.9.2',
      installation_date: new Date('2023-07-10'),
      last_maintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      reading_value: 2.8,
      reading_unit: 'mg/m³',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      alerts_count: 0,
      uptime: 95.4
    },
    {
      id: 4,
      name: 'Traffic Pollution Monitor',
      sensor_type: 'NO2',
      status: 'error',
      location_name: 'Chennai South',
      last_reading: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      calibration_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
      description: 'Specialized sensor for traffic-related pollution monitoring',
      battery_level: 23,
      signal_strength: 45,
      firmware_version: 'v1.8.5',
      installation_date: new Date('2023-06-01'),
      last_maintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      reading_value: 0,
      reading_unit: 'µg/m³',
      coordinates: { lat: 13.0827, lng: 80.2707 },
      alerts_count: 7,
      uptime: 76.2
    },
    {
      id: 5,
      name: 'Industrial SO2 Monitor',
      sensor_type: 'SO2',
      status: 'active',
      location_name: 'Kolkata West',
      last_reading: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
      calibration_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 days ago
      description: 'Heavy-duty sulfur dioxide sensor for industrial zones',
      battery_level: 78,
      signal_strength: 94,
      firmware_version: 'v2.0.7',
      installation_date: new Date('2023-10-01'),
      last_maintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      reading_value: 15.2,
      reading_unit: 'µg/m³',
      coordinates: { lat: 22.5726, lng: 88.3639 },
      alerts_count: 2,
      uptime: 97.8
    }
  ];

  // Always use dummy sensors for now until API is properly connected
  const sensors = dummySensors;

  useEffect(() => {
    // Comment out API call for now to use dummy data
    // dispatch(fetchSensors());
  }, [dispatch]);

  const handleAddSensor = () => {
    setSelectedSensor(null);
    setDialogOpen(true);
  };

  const handleEditSensor = (sensor) => {
    setSelectedSensor(sensor);
    setDialogOpen(true);
  };

  const handleDeleteSensor = (sensor) => {
    setSensorToDelete(sensor);
    setDeleteDialogOpen(true);
  };

  const handleSaveSensor = async (sensorData) => {
    try {
      if (selectedSensor) {
        // TODO: Implement updateSensor action in sensorsSlice
        console.log('Updating sensor:', { id: selectedSensor.id, ...sensorData });
      } else {
        // TODO: Implement addSensor action in sensorsSlice
        console.log('Adding sensor:', sensorData);
      }
      dispatch(fetchSensors()); // Refresh the list
    } catch (error) {
      console.error('Error saving sensor:', error);
    }
  };

  const confirmDelete = async () => {
    try {
      // TODO: Implement deleteSensor action in sensorsSlice
      console.log('Deleting sensor:', sensorToDelete.id);
      dispatch(fetchSensors()); // Refresh the list
      setDeleteDialogOpen(false);
      setSensorToDelete(null);
      alert(`✅ Sensor "${sensorToDelete.name}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting sensor:', error);
    }
  };

  const handleViewDetails = (sensor) => {
    setSensorForDetails(sensor);
    setDetailsDialogOpen(true);
  };

  const handleCalibrate = (sensor) => {
    setSensorToCalibrate(sensor);
    setCalibrateDialogOpen(true);
  };

  const handleRefreshSensors = () => {
    dispatch(fetchSensors());
    alert('🔄 Sensors refreshed successfully!');
  };

  // Filter sensors based on search and filters
  const filteredSensors = sensors.filter(sensor => {
    // Add null checks to prevent errors when properties are undefined
    const sensorName = sensor.name || '';
    const locationName = sensor.location_name || '';
    const sensorType = sensor.sensor_type || '';
    
    const matchesSearch = sensorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sensorType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sensor.status === statusFilter;
    const matchesType = typeFilter === 'all' || sensor.sensor_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group sensors by status
  const sensorsByStatus = sensors.reduce((acc, sensor) => {
    const status = sensor.status || 'unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(sensor);
    return acc;
  }, {});

  // Ensure we have proper counts for statistics
  const activeSensors = sensorsByStatus.active?.length || 0;
  const maintenanceSensors = sensorsByStatus.maintenance?.length || 0;
  const errorSensors = sensorsByStatus.error?.length || 0;
  const inactiveSensors = sensorsByStatus.inactive?.length || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🔧 Sensor Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor and manage all air quality sensors across locations
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshSensors}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddSensor}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6c5b7b 100%)'
              }
            }}
          >
            Add Sensor
          </Button>
        </Box>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search sensors, locations, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                  startAdornment={<FilterIcon sx={{ color: 'text.secondary', mr: 1 }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth sx={{ backgroundColor: 'white' }}>
                <InputLabel>Type Filter</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type Filter"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {sensorTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary" align="center">
                Showing {filteredSensors.length} of {sensors.length} sensors
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <SensorsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {sensors.length}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Total Sensors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {activeSensors}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Active Sensors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <WarningIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {maintenanceSensors}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 
            color: 'white',
            transition: 'transform 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <ErrorIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {errorSensors}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Errors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sensor Cards */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TimelineIcon color="primary" />
            Sensor Dashboard ({filteredSensors.length} sensors)
          </Typography>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={60} sx={{ color: '#667eea' }} />
          </Box>
        ) : filteredSensors.length > 0 ? (
          <Grid container spacing={3}>
            {filteredSensors.map((sensor) => (
              <Grid item xs={12} sm={6} md={4} key={sensor.id}>
                <SensorCard
                  sensor={sensor}
                  onEdit={handleEditSensor}
                  onDelete={handleDeleteSensor}
                  onViewDetails={handleViewDetails}
                  onCalibrate={handleCalibrate}
                />
              </Grid>
            ))}
          </Grid>
        ) : searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
          <Card sx={{ textAlign: 'center', py: 6, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
            <CardContent>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Sensors Match Your Filters
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Try adjusting your search terms or filter criteria
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ textAlign: 'center', py: 6, background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <CardContent>
              <SensorsIcon sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
              <Typography variant="h6" color="primary" gutterBottom>
                No Sensors Found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Start by adding your first sensor to begin monitoring air quality
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleAddSensor}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6c5b7b 100%)'
                  }
                }}
              >
                Add First Sensor
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <SensorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        sensor={selectedSensor}
        onSave={handleSaveSensor}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
          🗑️ Delete Sensor
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to delete the sensor <strong>"{sensorToDelete?.name}"</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone and will remove all associated data and readings.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sensor Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          📊 Sensor Details - {sensorForDetails?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {sensorForDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, background: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Basic Information
                  </Typography>
                  <Typography><strong>Name:</strong> {sensorForDetails.name}</Typography>
                  <Typography><strong>Type:</strong> {sensorForDetails.sensor_type}</Typography>
                  <Typography><strong>Location:</strong> {sensorForDetails.location_name}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={sensorForDetails.status} 
                      size="small" 
                      color={sensorForDetails.status === 'active' ? 'success' : 'warning'}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, background: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Current Readings
                  </Typography>
                  <Typography><strong>Value:</strong> {sensorForDetails.reading_value} {sensorForDetails.reading_unit}</Typography>
                  <Typography><strong>Battery:</strong> {sensorForDetails.battery_level}%</Typography>
                  <Typography><strong>Signal:</strong> {sensorForDetails.signal_strength}%</Typography>
                  <Typography><strong>Uptime:</strong> {sensorForDetails.uptime}%</Typography>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: '#f8f9fa' }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Maintenance Information
                  </Typography>
                  <Typography><strong>Installation Date:</strong> {sensorForDetails.installation_date ? new Date(sensorForDetails.installation_date).toLocaleDateString() : 'N/A'}</Typography>
                  <Typography><strong>Last Calibration:</strong> {sensorForDetails.calibration_date ? new Date(sensorForDetails.calibration_date).toLocaleDateString() : 'Never'}</Typography>
                  <Typography><strong>Last Maintenance:</strong> {sensorForDetails.last_maintenance ? new Date(sensorForDetails.last_maintenance).toLocaleDateString() : 'Never'}</Typography>
                  <Typography><strong>Firmware Version:</strong> {sensorForDetails.firmware_version}</Typography>
                  <Typography><strong>Active Alerts:</strong> {sensorForDetails.alerts_count}</Typography>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calibrate Sensor Dialog */}
      <Dialog 
        open={calibrateDialogOpen} 
        onClose={() => setCalibrateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          ⚙️ Calibrate Sensor - {sensorToCalibrate?.name}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Calibration will temporarily stop data collection and may take 5-10 minutes to complete.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Calibration Options:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                sx={{ p: 2, textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => {
                  alert('🔧 Quick calibration started! This will take about 2 minutes.');
                  setCalibrateDialogOpen(false);
                }}
              >
                <Box>
                  <Typography variant="subtitle1">Quick Calibration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Basic sensor alignment (2-3 minutes)
                  </Typography>
                </Box>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                sx={{ p: 2, textAlign: 'left', justifyContent: 'flex-start' }}
                onClick={() => {
                  alert('🔧 Full calibration started! This will take about 10 minutes.');
                  setCalibrateDialogOpen(false);
                }}
              >
                <Box>
                  <Typography variant="subtitle1">Full Calibration</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete sensor recalibration (8-10 minutes)
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCalibrateDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Sensors;