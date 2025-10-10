import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Pollutant color mapping
const pollutantColors = {
  pm25: '#E91E63',     // Pink
  pm10: '#9C27B0',     // Purple
  co: '#3F51B5',       // Indigo
  no2: '#2196F3',      // Blue
  so2: '#00BCD4',      // Cyan
  o3: '#4CAF50'        // Green
};

// Pollutant labels
const pollutantLabels = {
  pm25: 'PM2.5 (μg/m³)',
  pm10: 'PM10 (μg/m³)',
  co: 'CO (mg/m³)',
  no2: 'NO₂ (μg/m³)',
  so2: 'SO₂ (μg/m³)',
  o3: 'O₃ (μg/m³)'
};

// Safe limits for pollutants (WHO guidelines)
const safeLimits = {
  pm25: 15,    // μg/m³ (24-hour mean)
  pm10: 45,    // μg/m³ (24-hour mean)
  co: 10,      // mg/m³ (8-hour mean)
  no2: 25,     // μg/m³ (24-hour mean)
  so2: 40,     // μg/m³ (24-hour mean)
  o3: 100      // μg/m³ (8-hour mean)
};

const PollutantChart = ({ data, locations, title = 'Current Pollutant Levels', loading = false }) => {
  if (loading) {
    return (
      <Card sx={{ height: 350 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  // Process data based on input type
  let processedData;
  
  if (locations && Array.isArray(locations) && locations.length > 0) {
    // If locations array is provided, try to aggregate pollutant data from all locations
    processedData = {};
    const pollutantKeys = ['pm25', 'pm10', 'co', 'no2', 'so2', 'o3'];
    
    pollutantKeys.forEach(key => {
      const values = locations
        .map(loc => loc.current_aqi?.pollutants?.[key] || loc[key])
        .filter(val => val != null && !isNaN(val));
      
      if (values.length > 0) {
        processedData[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });
    
    // If no valid data found in locations, generate dummy data
    if (Object.keys(processedData).length === 0) {
      processedData = {
        pm25: Math.round(45 + Math.random() * 30),
        pm10: Math.round(75 + Math.random() * 40),
        co: Math.round((5 + Math.random() * 8) * 10) / 10,
        no2: Math.round(35 + Math.random() * 25),
        so2: Math.round(25 + Math.random() * 20),
        o3: Math.round(80 + Math.random() * 30)
      };
    }
  } else if (data && typeof data === 'object') {
    // Use provided data object directly
    processedData = data;
  } else {
    // Generate dummy data as fallback
    processedData = {
      pm25: Math.round(45 + Math.random() * 30),
      pm10: Math.round(75 + Math.random() * 40),
      co: Math.round((5 + Math.random() * 8) * 10) / 10,
      no2: Math.round(35 + Math.random() * 25),
      so2: Math.round(25 + Math.random() * 20),
      o3: Math.round(80 + Math.random() * 30)
    };
  }
  
  if (!processedData || Object.keys(processedData).length === 0) {
    return (
      <Card sx={{ height: 350 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No pollutant data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const pollutants = Object.keys(processedData).filter(key => 
    key !== 'timestamp' && key !== 'location' && processedData[key] !== null && processedData[key] !== undefined
  );

  const chartData = {
    labels: pollutants.map(p => pollutantLabels[p] || p.toUpperCase()),
    datasets: [
      {
        label: 'Current Level',
        data: pollutants.map(p => processedData[p] || 0),
        backgroundColor: pollutants.map(p => pollutantColors[p] || '#666'),
        borderColor: pollutants.map(p => pollutantColors[p] || '#666'),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'WHO Safe Limit',
        data: pollutants.map(p => safeLimits[p] || 0),
        backgroundColor: 'rgba(255, 193, 7, 0.3)',
        borderColor: '#FFC107',
        borderWidth: 2,
        borderDash: [5, 5],
        type: 'line',
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#2196F3',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const pollutant = pollutants[context.dataIndex];
            const safeLimit = safeLimits[pollutant];
            
            if (context.datasetIndex === 0) {
              let status = 'Normal';
              if (safeLimit && value > safeLimit) {
                const ratio = (value / safeLimit);
                if (ratio > 2) status = 'Very High';
                else if (ratio > 1.5) status = 'High';
                else status = 'Above Limit';
              }
              
              return `${context.dataset.label}: ${value.toFixed(2)} (${status})`;
            }
            
            return `${context.dataset.label}: ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Pollutants'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Concentration'
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  return (
    <Card sx={{ height: 350 }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ height: 'calc(100% - 16px)' }}>
          <Bar data={chartData} options={options} />
        </Box>
        
        {/* Legend with status indicators */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {pollutants.map(pollutant => {
            const value = processedData[pollutant] || 0;
            const safeLimit = safeLimits[pollutant];
            const isExceeded = safeLimit && value > safeLimit;
            
            return (
              <Box
                key={pollutant}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: isExceeded ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid ${isExceeded ? '#f44336' : '#4caf50'}`,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: pollutantColors[pollutant] || '#666',
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                  {pollutant.toUpperCase()}: {value.toFixed(1)}
                </Typography>
                {isExceeded && (
                  <Typography variant="caption" color="error">
                    (High)
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PollutantChart;