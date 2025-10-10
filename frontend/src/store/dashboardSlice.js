import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Dummy data fallback
const getDummyLocations = () => [
  {
    id: 'dummy-1',
    name: 'Bangalore_East',
    city: 'Bangalore',
    current_aqi: {
      aqi: 104,
      status: 'UNHEALTHY_SG',
      dominant_pollutant: 'PM25',
      timestamp: new Date().toISOString()
    },
    sensor_status: { total: 1, active: 1, offline: 0, maintenance: 0 },
    alert_count: 1
  },
  {
    id: 'dummy-2',
    name: 'Chennai_South',
    city: 'Chennai',
    current_aqi: {
      aqi: 87,
      status: 'MODERATE',
      dominant_pollutant: 'PM10',
      timestamp: new Date().toISOString()
    },
    sensor_status: { total: 1, active: 1, offline: 0, maintenance: 0 },
    alert_count: 0
  },
  {
    id: 'dummy-3',
    name: 'Delhi_North',
    city: 'Delhi',
    current_aqi: {
      aqi: 156,
      status: 'UNHEALTHY',
      dominant_pollutant: 'PM25',
      timestamp: new Date().toISOString()
    },
    sensor_status: { total: 1, active: 1, offline: 0, maintenance: 0 },
    alert_count: 2
  },
  {
    id: 'dummy-4',
    name: 'Kolkata_West',
    city: 'Kolkata',
    current_aqi: {
      aqi: 72,
      status: 'MODERATE',
      dominant_pollutant: 'NO2',
      timestamp: new Date().toISOString()
    },
    sensor_status: { total: 1, active: 1, offline: 0, maintenance: 0 },
    alert_count: 0
  },
  {
    id: 'dummy-5',
    name: 'Mumbai_Central',
    city: 'Mumbai',
    current_aqi: {
      aqi: 92,
      status: 'MODERATE',
      dominant_pollutant: 'O3',
      timestamp: new Date().toISOString()
    },
    sensor_status: { total: 1, active: 1, offline: 0, maintenance: 0 },
    alert_count: 0
  }
];

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/locations/dashboard/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'dashboard/fetchAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/analytics/dashboard/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  locations: [],
  analytics: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  realTimeData: {},
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateRealTimeData: (state, action) => {
      const { locationId, data } = action.payload;
      state.realTimeData[locationId] = data;
      state.lastUpdated = new Date().toISOString();
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.locations = action.payload && action.payload.length > 0 ? action.payload : getDummyLocations();
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Use dummy data as fallback when API fails
        state.locations = getDummyLocations();
      })
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload || {
          total_locations: 5,
          active_sensors: 5,
          average_aqi: 102.2,
          unhealthy_locations: 2,
          last_update: new Date().toISOString(),
          trends: { aqi: -5.2, sensors: 0 }
        };
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Use dummy analytics data as fallback
        state.analytics = {
          total_locations: 5,
          active_sensors: 5,
          average_aqi: 102.2,
          unhealthy_locations: 2,
          last_update: new Date().toISOString(),
          trends: { aqi: -5.2, sensors: 0 }
        };
      });
  },
});

export const { updateRealTimeData, clearError, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;