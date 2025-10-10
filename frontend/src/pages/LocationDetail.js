import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

const LocationDetail = () => {
  const { locationId } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get(`/locations/${locationId}`);
        // setLocationData(response.data);
        
        // Mock data for now
        setTimeout(() => {
          setLocationData({
            id: locationId,
            name: `Location ${locationId}`,
            address: '123 Main Street, City',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            aqiValue: 75,
            status: 'Moderate',
            lastUpdated: new Date().toISOString(),
            sensors: [
              { id: 1, type: 'PM2.5', value: 25, unit: 'μg/m³' },
              { id: 2, type: 'PM10', value: 40, unit: 'μg/m³' },
              { id: 3, type: 'NO2', value: 30, unit: 'ppb' },
              { id: 4, type: 'O3', value: 55, unit: 'ppb' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch location data');
        setLoading(false);
      }
    };

    if (locationId) {
      fetchLocationData();
    }
  }, [locationId]);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FF9800';
    if (aqi <= 150) return '#F44336';
    if (aqi <= 200) return '#9C27B0';
    if (aqi <= 300) return '#795548';
    return '#B71C1C';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!locationData) {
    return (
      <Box p={3}>
        <Alert severity="warning">Location not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {locationData.name}
      </Typography>
      
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {locationData.address}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Air Quality Index
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography 
                  variant="h2" 
                  sx={{ color: getAQIColor(locationData.aqiValue) }}
                >
                  {locationData.aqiValue}
                </Typography>
                <Chip 
                  label={locationData.status}
                  sx={{ 
                    backgroundColor: getAQIColor(locationData.aqiValue),
                    color: 'white'
                  }}
                />
              </Box>
              <Typography variant="caption" color="textSecondary">
                Last updated: {new Date(locationData.lastUpdated).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Coordinates
              </Typography>
              <Typography variant="body1">
                Latitude: {locationData.coordinates.lat}
              </Typography>
              <Typography variant="body1">
                Longitude: {locationData.coordinates.lng}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sensor Readings
              </Typography>
              <Grid container spacing={2}>
                {locationData.sensors.map((sensor) => (
                  <Grid item xs={12} sm={6} md={3} key={sensor.id}>
                    <Box 
                      p={2} 
                      border={1} 
                      borderColor="divider" 
                      borderRadius={1}
                      textAlign="center"
                    >
                      <Typography variant="h6" color="primary">
                        {sensor.value}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {sensor.type}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {sensor.unit}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationDetail;