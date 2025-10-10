import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Page components
import Dashboard from './pages/Dashboard';
import LocationDetail from './pages/LocationDetail';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Sensors from './pages/Sensors';
import Reports from './pages/Reports';

// WebSocket connection for real-time updates (temporarily disabled)
// import useWebSocket from './services/websocket';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Initialize WebSocket connections (temporarily disabled)
  // useWebSocket('/ws/dashboard/', {
  //   maxReconnectAttempts: 5,
  //   reconnectInterval: 3000,
  // });

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top navigation */}
        <Navbar onMenuClick={handleSidebarToggle} />
        
        {/* Main content area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            minHeight: 'calc(100vh - 64px)', // Account for navbar height
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/location/:locationId" element={<LocationDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;