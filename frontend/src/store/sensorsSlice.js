import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchSensors = createAsyncThunk(
  'sensors/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/sensors/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSensorReadings = createAsyncThunk(
  'sensors/fetchReadings',
  async ({ sensorId, hours = 24 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/monitoring/sensors/${sensorId}/readings/`, {
        params: { hours }
      });
      return { sensorId, readings: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTimeSeriesData = createAsyncThunk(
  'sensors/fetchTimeSeries',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/readings/time_series/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  sensors: [],
  sensorReadings: {},
  timeSeriesData: [],
  selectedSensor: null,
  isLoading: false,
  error: null,
  filters: {
    location: null,
    status: 'ACTIVE',
  },
};

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    setSelectedSensor: (state, action) => {
      state.selectedSensor = action.payload;
    },
    updateSensorStatus: (state, action) => {
      const { sensorId, status } = action.payload;
      const sensor = state.sensors.find(s => s.sensor_id === sensorId);
      if (sensor) {
        sensor.status = status;
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    addRealtimeReading: (state, action) => {
      const { sensorId, reading } = action.payload;
      if (!state.sensorReadings[sensorId]) {
        state.sensorReadings[sensorId] = [];
      }
      state.sensorReadings[sensorId].unshift(reading);
      // Keep only last 100 readings per sensor
      if (state.sensorReadings[sensorId].length > 100) {
        state.sensorReadings[sensorId] = state.sensorReadings[sensorId].slice(0, 100);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sensors
      .addCase(fetchSensors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sensors = action.payload.results || action.payload;
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch sensor readings
      .addCase(fetchSensorReadings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSensorReadings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { sensorId, readings } = action.payload;
        state.sensorReadings[sensorId] = readings.results || readings;
      })
      .addCase(fetchSensorReadings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch time series data
      .addCase(fetchTimeSeriesData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimeSeriesData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timeSeriesData = action.payload;
      })
      .addCase(fetchTimeSeriesData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedSensor, 
  updateSensorStatus, 
  setFilters, 
  clearError, 
  addRealtimeReading 
} = sensorsSlice.actions;

export default sensorsSlice.reducer;