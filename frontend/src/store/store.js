import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';
import alertsReducer from './alertsSlice';
import sensorsReducer from './sensorsSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    alerts: alertsReducer,
    sensors: sensorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Export types for TypeScript (if using TypeScript, rename this file to store.ts)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;