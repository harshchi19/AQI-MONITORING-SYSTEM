import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// AQI color mapping for chart
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#4CAF50'; // Good - Green
  if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
  if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return '#F44336'; // Unhealthy - Red
  if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
  return '#8D6E63'; // Hazardous - Maroon
};

// Generate dummy trend data
const generateDummyTrendData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseAQI = 85 + Math.sin(i * 0.3) * 20 + Math.random() * 15;
    
    data.push({
      timestamp: time.toISOString(),
      aqi: Math.max(25, Math.min(180, Math.round(baseAQI))),
      pm25: Math.round(baseAQI * 0.6),
      pm10: Math.round(baseAQI * 0.8),
      no2: Math.round(baseAQI * 0.4),
      so2: Math.round(baseAQI * 0.3),
      co: Math.round(baseAQI * 0.2),
      o3: Math.round(baseAQI * 0.5)
    });
  }
  
  return data;
};

const AQITrendChart = ({ data, locations, timeRange = '24h', locationName = '', loading = false }) => {
  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  // Use data prop if provided, otherwise generate dummy trend data
  // Locations data is not trend data, so we should generate dummy data
  const inputData = data;
  
  // Always generate dummy trend data if no proper trend data is available
  const dummyData = (!inputData || !Array.isArray(inputData) || inputData.length === 0 || !inputData[0]?.timestamp) 
    ? generateDummyTrendData() 
    : inputData;

  if (!dummyData || dummyData.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: dummyData.map(point => {
      const date = new Date(point.timestamp);
      return timeRange === '24h' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'AQI',
        data: dummyData.map(point => point.aqi),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: dummyData.map(point => getAQIColor(point.aqi)),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
        text: `AQI Trend${locationName ? ` - ${locationName}` : ''} (${timeRange})`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: false
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
            const aqi = context.parsed.y;
            let status;
            if (aqi <= 50) status = 'Good';
            else if (aqi <= 100) status = 'Moderate';
            else if (aqi <= 150) status = 'Unhealthy for Sensitive Groups';
            else if (aqi <= 200) status = 'Unhealthy';
            else if (aqi <= 300) status = 'Very Unhealthy';
            else status = 'Hazardous';
            
            return `AQI: ${aqi} (${status})`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'AQI Value'
        },
        min: 0,
        max: Math.max(350, Math.max(...dummyData.map(point => point.aqi)) * 1.1),
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        // Add AQI category lines
        afterDraw: (chart) => {
          const ctx = chart.ctx;
          const yAxis = chart.scales.y;
          
          // AQI category boundaries
          const categories = [
            { value: 50, color: '#4CAF50', label: 'Good' },
            { value: 100, color: '#FFEB3B', label: 'Moderate' },
            { value: 150, color: '#FF9800', label: 'Unhealthy for Sensitive' },
            { value: 200, color: '#F44336', label: 'Unhealthy' },
            { value: 300, color: '#9C27B0', label: 'Very Unhealthy' }
          ];
          
          categories.forEach(category => {
            const y = yAxis.getPixelForValue(category.value);
            ctx.save();
            ctx.strokeStyle = category.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(chart.chartArea.left, y);
            ctx.lineTo(chart.chartArea.right, y);
            ctx.stroke();
            ctx.restore();
          });
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <Card sx={{ height: 400 }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ height: 'calc(100% - 16px)' }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AQITrendChart;