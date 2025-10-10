import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchActiveAlerts = createAsyncThunk(
  'alerts/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/alerts/active/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async (alertId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/monitoring/alerts/${alertId}/acknowledge/`);
      return { alertId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchAlertSummary = createAsyncThunk(
  'alerts/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/monitoring/alerts/summary/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  activeAlerts: [],
  summary: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
  lastUpdated: null,
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addNewAlert: (state, action) => {
      state.activeAlerts.unshift(action.payload);
      state.unreadCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
    markAlertAsRead: (state, action) => {
      const alertId = action.payload;
      const alert = state.activeAlerts.find(a => a.id === alertId);
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true;
        alert.acknowledged_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active alerts
      .addCase(fetchActiveAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeAlerts = action.payload;
        state.unreadCount = action.payload.filter(alert => !alert.acknowledged).length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchActiveAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Acknowledge alert
      .addCase(acknowledgeAlert.pending, (state) => {
        state.error = null;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const { alertId } = action.payload;
        const alert = state.activeAlerts.find(a => a.id === alertId);
        if (alert) {
          alert.acknowledged = true;
          alert.acknowledged_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch alert summary
      .addCase(fetchAlertSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export const { addNewAlert, markAlertAsRead, clearError, resetUnreadCount } = alertsSlice.actions;
export default alertsSlice.reducer;