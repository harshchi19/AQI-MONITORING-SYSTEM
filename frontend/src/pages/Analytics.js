import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Container,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  MenuItem as MenuItemComponent,
  Badge
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   ScatterChart,
//   Scatter
} from 'recharts';
import {
//   Timeline,
//   ShowChart,
//   PieChart as PieChartIcon,
//   BarChart as BarChartIcon,
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as AnalyticsIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Refresh,
  DateRange,
  LocationOn,
  Air,
  Warning,
  CheckCircle,
  Error,
  Info,
  Notifications
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [pollutant, setPollutant] = useState('PM2.5');
  const [location, setLocation] = useState('all');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  // Comprehensive locations and pollutants data - memoized to prevent unnecessary re-renders
  const locations = React.useMemo(() => [
    { id: 'all', name: 'All Locations' },
    { id: 'mumbai', name: 'Mumbai Central' },
    { id: 'delhi', name: 'Delhi North' },
    { id: 'bangalore', name: 'Bangalore East' },
    { id: 'chennai', name: 'Chennai South' },
    { id: 'kolkata', name: 'Kolkata West' },
    { id: 'hyderabad', name: 'Hyderabad Tech City' },
    { id: 'pune', name: 'Pune Downtown' },
    { id: 'ahmedabad', name: 'Ahmedabad Industrial' }
  ], []);

  const pollutants = React.useMemo(() => [
    { id: 'PM2.5', name: 'PM2.5', unit: 'µg/m³', color: '#8884d8' },
    { id: 'PM10', name: 'PM10', unit: 'µg/m³', color: '#82ca9d' },
    { id: 'NO2', name: 'NO2', unit: 'µg/m³', color: '#ffc658' },
    { id: 'O3', name: 'O3', unit: 'µg/m³', color: '#ff7300' },
    { id: 'CO', name: 'CO', unit: 'mg/m³', color: '#00bcd4' },
    { id: 'SO2', name: 'SO2', unit: 'µg/m³', color: '#e91e63' }
  ], []);

  // Enhanced dummy data generator (moved outside to avoid dependency issues)
  const generateAnalyticsData = React.useCallback((timeRange, pollutant, location) => {
    const now = new Date();
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const hours = timeRange === '24h' ? 24 : days * (timeRange === '7d' ? 4 : 2); // Different granularity
    
    // Generate comprehensive time series data
    const timeSeriesData = Array.from({ length: hours }, (_, i) => {
      const date = new Date(now - (hours - i - 1) * (timeRange === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000));
      const baseValue = Math.random() * 80 + 20; // 20-100 range
      const aqiValue = Math.round(baseValue * 1.2); // Convert to AQI-like value
      
      return {
        date: timeRange === '24h' ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(baseValue * 10) / 10,
        aqi: aqiValue,
        temperature: Math.round((25 + (Math.random() - 0.5) * 10) * 10) / 10,
        humidity: Math.round((60 + (Math.random() - 0.5) * 20) * 10) / 10,
        windSpeed: Math.round((5 + Math.random() * 10) * 10) / 10
      };
    });

    // Multi-pollutant data
    const multiPollutantData = timeSeriesData.map(item => {
      const result = { ...item };
      pollutants.forEach(p => {
        if (p.id !== pollutant) {
          const baseVal = { 'PM2.5': 45, 'PM10': 65, 'NO2': 35, 'O3': 28, 'CO': 2.5, 'SO2': 15 }[p.id];
          result[p.id] = Math.round((baseVal + (Math.random() - 0.5) * 20) * 10) / 10;
        } else {
          result[p.id] = item.value;
        }
      });
      return result;
    });

    // Location-wise data
    const locationData = locations.slice(1).map(loc => {
      const value = Math.round((30 + Math.random() * 60) * 10) / 10;
      const getStatus = (val) => {
        if (val <= 50) return 'Good';
        if (val <= 100) return 'Moderate';
        if (val <= 150) return 'Unhealthy for Sensitive Groups';
        return 'Unhealthy';
      };
      
      return {
        location: loc.name,
        value: value,
        status: getStatus(value),
        current: value,
        average: Math.round((25 + Math.random() * 50) * 10) / 10,
        max: Math.round((50 + Math.random() * 100) * 10) / 10,
        min: Math.round((10 + Math.random() * 20) * 10) / 10,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.25 ? 'down' : 'stable',
        alertsCount: Math.floor(Math.random() * 15),
        sensors: Math.floor(Math.random() * 8) + 2,
        population: Math.floor(Math.random() * 5000000) + 1000000
      };
    });

    // AQI distribution data
    const aqiDistribution = [
      { category: 'Good (0-50)', value: 30, color: '#4caf50', count: 145 },
      { category: 'Moderate (51-100)', value: 45, color: '#ffeb3b', count: 289 },
      { category: 'Unhealthy for Sensitive Groups (101-150)', value: 15, color: '#ff9800', count: 87 },
      { category: 'Unhealthy (151-200)', value: 7, color: '#f44336', count: 34 },
      { category: 'Very Unhealthy (201-300)', value: 2.5, color: '#9c27b0', count: 12 },
      { category: 'Hazardous (300+)', value: 0.5, color: '#795548', count: 3 }
    ];

    // Hourly patterns
    const hourlyPatterns = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      value: Math.round((40 + 20 * Math.sin((hour - 6) * Math.PI / 12) + Math.random() * 10) * 10) / 10,
      traffic: Math.round((30 + 40 * Math.sin((hour - 8) * Math.PI / 8)) * 10) / 10
    }));

    // Weather correlation data
    const weatherCorrelation = timeSeriesData.map(item => ({
      ...item,
      pm25: item.value,
      temperature: item.temperature,
      humidity: item.humidity,
      windSpeed: item.windSpeed,
      pressure: Math.round((1013 + (Math.random() - 0.5) * 20) * 10) / 10
    }));

    // Health impact data
    const healthImpact = {
      riskLevel: 'Moderate',
      affectedPopulation: Math.floor(Math.random() * 500000) + 100000,
      recommendations: [
        'Sensitive individuals should limit outdoor activities',
        'Use air purifiers indoors',
        'Wear N95 masks when outdoors',
        'Keep windows closed during peak hours'
      ],
      dailyAverages: {
        current: Math.round(timeSeriesData[timeSeriesData.length - 1]?.value || 45),
        yesterday: Math.round((timeSeriesData[timeSeriesData.length - 1]?.value || 45) * (0.9 + Math.random() * 0.2)),
        weekAvg: Math.round(timeSeriesData.reduce((sum, item) => sum + item.value, 0) / timeSeriesData.length)
      }
    };

    // Create comprehensive summary with proper AQI calculations
    const averageAQI = Math.round(timeSeriesData.reduce((sum, item) => sum + item.aqi, 0) / timeSeriesData.length);
    const maxAQI = Math.max(...timeSeriesData.map(item => item.aqi));
    const minAQI = Math.min(...timeSeriesData.map(item => item.aqi));
    const trendDirection = timeSeriesData.length > 1 ? 
      (timeSeriesData[timeSeriesData.length - 1].aqi > timeSeriesData[timeSeriesData.length - 2].aqi ? 'worsening' : 'improving') : 'stable';

    return {
      timeSeriesData,
      trendData: timeSeriesData, // Add trendData alias for compatibility
      multiPollutantData,
      locationData,
      aqiDistribution,
      hourlyPatterns,
      hourlyPattern: hourlyPatterns, // Add hourlyPattern alias for compatibility
      weatherCorrelation,
      healthImpact: {
        ...healthImpact,
        healthMetrics: {
          respiratoryIssues: Math.floor(Math.random() * 25) + 15,
          cardiovascularRisk: Math.floor(Math.random() * 20) + 10,
          allergicReactions: Math.floor(Math.random() * 30) + 20,
          eyeIrritation: Math.floor(Math.random() * 35) + 25
        },
        sensitiveGroups: Math.floor(Math.random() * 200000) + 50000
      },
      pollutantComparison: pollutants.map(p => {
        const currentValue = Math.round((Math.random() * 80) + 20);
        const limit = { 'PM2.5': 60, 'PM10': 100, 'NO2': 80, 'O3': 120, 'CO': 10, 'SO2': 80 }[p.id];
        return {
          pollutant: p.name,
          current: currentValue,
          limit: `${limit} ${p.unit}`,
          percentage: Math.round((currentValue / limit) * 100),
          trend: Math.random() > 0.5 ? 'improving' : Math.random() > 0.25 ? 'worsening' : 'stable'
        };
      }),
      metadata: {
        totalSensors: locationData.reduce((sum, loc) => sum + loc.sensors, 0),
        totalPopulation: locationData.reduce((sum, loc) => sum + (Math.floor(Math.random() * 5000000) + 1000000), 0)
      },
      summary: {
        current: timeSeriesData[timeSeriesData.length - 1]?.value || 0,
        average: Math.round(timeSeriesData.reduce((sum, item) => sum + item.value, 0) / timeSeriesData.length * 10) / 10,
        max: Math.max(...timeSeriesData.map(item => item.value)),
        min: Math.min(...timeSeriesData.map(item => item.value)),
        trend: timeSeriesData.length > 1 ? 
          (timeSeriesData[timeSeriesData.length - 1].value > timeSeriesData[timeSeriesData.length - 2].value ? 'improving' : 'worsening') : 'stable',
        totalReadings: timeSeriesData.length,
        alertsTriggered: Math.floor(Math.random() * 25) + 5,
        complianceRate: Math.round((85 + Math.random() * 10) * 10) / 10,
        // Add AQI-specific summary data
        averageAQI,
        maxAQI,
        minAQI,
        trendDirection,
        dataPoints: timeSeriesData.length,
        variance: Math.round(Math.abs(maxAQI - minAQI) * 0.1)
      }
    };
  }, [pollutants, locations]); // Add dependencies for useCallback

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call with enhanced data
        setTimeout(() => {
          const data = generateAnalyticsData(timeRange, pollutant, location);
          setAnalyticsData(data);
          setLoading(false);
        }, Math.random() * 1000 + 500); // Random delay for realism
      } catch (err) {
        setError('Failed to fetch analytics data. Please try again.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, pollutant, location, generateAnalyticsData]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handlePollutantChange = (event) => {
    setPollutant(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
  };

  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToExcel = () => {
    if (!analyticsData) return;

    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['Metric', 'Value'],
      ['Average AQI', analyticsData.summary.averageAQI],
      ['Maximum AQI', analyticsData.summary.maxAQI],
      ['Minimum AQI', analyticsData.summary.minAQI],
      ['Trend Direction', analyticsData.summary.trendDirection],
      ['Time Range', timeRange],
      ['Pollutant', pollutant],
      ['Generated At', new Date().toLocaleString()]
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Trend data
    const trendSheet = XLSX.utils.json_to_sheet(analyticsData.trendData);
    XLSX.utils.book_append_sheet(workbook, trendSheet, 'Trend Data');

    // Location data
    const locationSheet = XLSX.utils.json_to_sheet(analyticsData.locationData);
    XLSX.utils.book_append_sheet(workbook, locationSheet, 'Location Data');

    // Pollutant comparison
    const pollutantSheet = XLSX.utils.json_to_sheet(analyticsData.pollutantComparison);
    XLSX.utils.book_append_sheet(workbook, pollutantSheet, 'Pollutant Analysis');

    // Export file
    const fileName = `AQI_Analytics_${timeRange}_${pollutant}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    handleExportClose();
    alert(`✅ Excel file "${fileName}" has been downloaded successfully!`);
  };

  const exportToPDF = () => {
    if (!analyticsData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text('AQI Analytics Report', pageWidth / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Time Range: ${timeRange} | Pollutant: ${pollutant}`, pageWidth / 2, 30, { align: 'center' });

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Executive Summary', 20, 50);

    const summaryData = [
      ['Metric', 'Value', 'Status'],
      ['Average AQI', analyticsData.summary.averageAQI.toString(), analyticsData.summary.averageAQI > 100 ? 'Concerning' : 'Acceptable'],
      ['Maximum AQI', analyticsData.summary.maxAQI.toString(), analyticsData.summary.maxAQI > 150 ? 'Unhealthy' : 'Moderate'],
      ['Minimum AQI', analyticsData.summary.minAQI.toString(), analyticsData.summary.minAQI < 50 ? 'Good' : 'Moderate'],
      ['Trend Direction', analyticsData.summary.trendDirection, analyticsData.summary.trendDirection === 'improving' ? 'Positive' : 'Negative'],
      ['Data Points', analyticsData.summary.dataPoints.toString(), 'Complete'],
      ['Total Sensors', analyticsData.metadata.totalSensors.toString(), 'Active'],
      ['Population Monitored', (analyticsData.metadata.totalPopulation / 1000000).toFixed(1) + 'M', 'Coverage']
    ];

    doc.autoTable({
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'center' }
      }
    });

    // Location Analysis
    let yPosition = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Location Analysis', 20, yPosition);

    const locationTableData = analyticsData.locationData.map(loc => [
      loc.location,
      loc.value.toString(),
      loc.status,
      loc.sensors.toString(),
      (loc.population / 1000000).toFixed(1) + 'M'
    ]);

    doc.autoTable({
      head: [['Location', 'AQI', 'Status', 'Sensors', 'Population']],
      body: locationTableData,
      startY: yPosition + 10,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' }
      }
    });

    // Health Impact (if it fits on the page)
    yPosition = doc.lastAutoTable.finalY + 15;
    if (yPosition < pageHeight - 60) {
      doc.setFontSize(16);
      doc.text('Health Impact Assessment', 20, yPosition);

      doc.setFontSize(12);
      doc.text(`Risk Level: ${analyticsData.healthImpact.riskLevel}`, 20, yPosition + 15);
      doc.text(`Affected Population: ${(analyticsData.healthImpact.affectedPopulation / 1000000).toFixed(1)}M people`, 20, yPosition + 25);
      doc.text(`Sensitive Groups: ${(analyticsData.healthImpact.sensitiveGroups / 1000).toFixed(0)}K people`, 20, yPosition + 35);

      doc.setFontSize(10);
      doc.text('Recommendations:', 20, yPosition + 50);
      analyticsData.healthImpact.recommendations.forEach((rec, index) => {
        doc.text(`• ${rec}`, 25, yPosition + 60 + (index * 8));
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by AQI Monitoring System | Real-time Air Quality Analytics', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `AQI_Report_${timeRange}_${pollutant}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    handleExportClose();
    alert(`✅ PDF report "${fileName}" has been downloaded successfully!`);
  };

  const handleRefresh = () => {
    setAnalyticsData(null);
    setLoading(true);
    const data = generateAnalyticsData(timeRange, pollutant, location);
    setTimeout(() => {
      setAnalyticsData(data);
      setLoading(false);
    }, 800);
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving': return <TrendingUp sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />;
      case 'worsening': return <TrendingDown sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />;
      default: return <TrendingFlat sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />;
    }
  };

  const getAQIColor = (value) => {
    if (value <= 50) return '#4CAF50';
    if (value <= 100) return '#FFEB3B';
    if (value <= 150) return '#FF9800';
    if (value <= 200) return '#F44336';
    if (value <= 300) return '#9C27B0';
    return '#795548';
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'good': return <CheckCircle sx={{ color: '#4CAF50' }} />;
      case 'moderate': return <Warning sx={{ color: '#FF9800' }} />;
      case 'unhealthy': return <Error sx={{ color: '#F44336' }} />;
      default: return <Info sx={{ color: '#2196F3' }} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress size={60} sx={{ color: '#667eea', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Analytics Data...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Fetching real-time air quality insights
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Enhanced Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography component="h1" gutterBottom sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}>
            <AnalyticsIcon sx={{ color: '#667eea', fontSize: { xs: 32, sm: 40 } }} />
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Comprehensive air quality data analysis and insights
          </Typography>
        </Box>
        <Box display="flex" gap={{ xs: 1, sm: 2 }} flexWrap="wrap">
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2',
              '&:hover': { backgroundColor: '#bbdefb' },
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 }
            }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={handleExportClick}
            size="medium"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6c5b7b 100%)'
              },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '6px 12px', sm: '8px 16px' }
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Export Data</Box>
            <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Export</Box>
          </Button>
        </Box>
      </Box>

      {/* Enhanced Controls */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
        <CardContent sx={{ py: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select 
                  value={timeRange} 
                  onChange={handleTimeRangeChange} 
                  label="Time Range"
                  startAdornment={<DateRange sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Pollutant</InputLabel>
                <Select 
                  value={pollutant} 
                  onChange={handlePollutantChange} 
                  label="Pollutant"
                  startAdornment={<Air sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="PM2.5">PM2.5</MenuItem>
                  <MenuItem value="PM10">PM10</MenuItem>
                  <MenuItem value="NO2">NO2</MenuItem>
                  <MenuItem value="O3">O3</MenuItem>
                  <MenuItem value="SO2">SO2</MenuItem>
                  <MenuItem value="CO">CO</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select 
                  value={location} 
                  onChange={handleLocationChange} 
                  label="Location"
                  startAdornment={<LocationOn sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="mumbai">Mumbai Central</MenuItem>
                  <MenuItem value="delhi">Delhi North</MenuItem>
                  <MenuItem value="bangalore">Bangalore East</MenuItem>
                  <MenuItem value="chennai">Chennai South</MenuItem>
                  <MenuItem value="kolkata">Kolkata West</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {new Date().toLocaleTimeString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, minHeight: { xs: 160, sm: 180 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />
              <Typography sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                {analyticsData?.summary.averageAQI}
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Average AQI
              </Typography>
              <Chip 
                label={`±${analyticsData?.summary.variance}`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, minHeight: { xs: 160, sm: 180 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <TrendingUp sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />
              <Typography sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                {analyticsData?.summary.maxAQI}
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Maximum AQI
              </Typography>
              <Chip 
                label="Peak Value" 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', 
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, minHeight: { xs: 160, sm: 180 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <TrendingDown sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1, opacity: 0.9 }} />
              <Typography sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
                {analyticsData?.summary.minAQI}
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Minimum AQI
              </Typography>
              <Chip 
                label="Best Value" 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: `linear-gradient(135deg, ${analyticsData?.summary.trendDirection === 'improving' ? '#4CAF50' : '#F44336'} 0%, ${analyticsData?.summary.trendDirection === 'improving' ? '#2E7D32' : '#C62828'} 100%)`, 
            color: 'white',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
          }}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, sm: 3 }, minHeight: { xs: 160, sm: 180 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {getTrendIcon(analyticsData?.summary.trendDirection)}
              <Typography sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {analyticsData?.summary.trendDirection === 'improving' ? 'Improving' : 'Worsening'}
              </Typography>
              <Typography sx={{ opacity: 0.9, mb: 1, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Trend
              </Typography>
              <Chip 
                label={`${analyticsData?.summary.dataPoints} points`} 
                size="small" 
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Enhanced Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 400 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  📈 Air Quality Trends
                </Typography>
                <Chip 
                  label={`${analyticsData?.multiPollutantData?.length || 0} data points`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ width: '100%', height: { xs: 280, sm: 320, md: 350 }, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData?.multiPollutantData || []}>
                  <defs>
                    <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPM10" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="PM2.5" stroke="#8884d8" fillOpacity={0.6} fill="url(#colorPM25)" strokeWidth={2} name="PM2.5" />
                  <Area type="monotone" dataKey="PM10" stroke="#82ca9d" fillOpacity={0.6} fill="url(#colorPM10)" strokeWidth={2} name="PM10" />
                  <Line type="monotone" dataKey="NO2" stroke="#ffc658" strokeWidth={2} name="NO2" />
                  <Line type="monotone" dataKey="O3" stroke="#ff7300" strokeWidth={2} name="O3" />
                </AreaChart>
              </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced AQI Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 400 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  🎯 AQI Distribution
                </Typography>
                <Badge badgeContent={analyticsData?.aqiDistribution?.length || 0} color="primary">
                  <Chip label="Categories" size="small" variant="outlined" />
                </Badge>
              </Box>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.aqiDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {analyticsData?.aqiDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value, name, props) => [
                      `${props.payload.count} readings`,
                      props.payload.category
                    ]}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </Box>
              <Box mt={1}>
                {analyticsData?.aqiDistribution.slice(0, 3).map((item, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between" py={0.5}>
                    <Box display="flex" alignItems="center">
                      <Box 
                        width={12} 
                        height={12} 
                        bgcolor={item.color} 
                        borderRadius="50%" 
                        mr={1}
                      />
                      <Typography variant="caption">{item.category.split(' ')[0]}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="medium">
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Location Analysis */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ minHeight: 380 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography sx={{ fontWeight: 600, color: '#2c3e50', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  🌍 Air Quality by Location
                </Typography>
                <Chip 
                  label={`${analyticsData?.locationData?.length || 0} cities`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ width: '100%', height: { xs: 250, sm: 280, md: 300 }, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData?.locationData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="location" tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value, name, props) => [
                      `AQI: ${value}`,
                      `Status: ${props.payload.status}`,
                      `Sensors: ${props.payload.sensors}`,
                      `Population: ${(props.payload.population / 1000000).toFixed(1)}M`
                    ]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                    stroke="#fff"
                    strokeWidth={1}
                  >
                    {analyticsData?.locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAQIColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pollutant Comparison */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: { lg: 380 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography gutterBottom sx={{ fontWeight: 600, color: '#2c3e50', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                🧪 Pollutant Analysis
              </Typography>
              <Box 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '3px',
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}
              >
                {analyticsData?.pollutantComparison.map((item, index) => (
                  <Box key={index} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="medium">
                        {item.pollutant}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          {item.current.toFixed(1)}
                        </Typography>
                        {getTrendIcon(item.trend)}
                      </Box>
                    </Box>
                    <Box position="relative">
                      <Box 
                        height={8} 
                        bgcolor="#f0f0f0" 
                        borderRadius={4}
                        overflow="hidden"
                      >
                        <Box 
                          height="100%" 
                          bgcolor={item.percentage > 100 ? '#f44336' : item.percentage > 80 ? '#ff9800' : '#4caf50'}
                          width={`${Math.min(100, item.percentage)}%`}
                          borderRadius={4}
                          sx={{ transition: 'width 0.3s ease' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {item.percentage}% of limit ({item.limit})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Hourly Pattern */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography gutterBottom sx={{ fontWeight: 600, color: '#2c3e50', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                🕐 24-Hour Pattern Analysis
              </Typography>
              <Box sx={{ width: '100%', height: { xs: 200, sm: 230, md: 250 }, overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData?.hourlyPattern || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px' 
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} name="AQI" />
                  <Line yAxisId="right" type="monotone" dataKey="traffic" stroke="#82ca9d" strokeWidth={2} name="Traffic Index" strokeDasharray="5 5" />
                  <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#ffc658" strokeWidth={2} name="Temperature °C" />
                </LineChart>
              </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Health Impact Summary */}
        <Grid item xs={12}>
          <Card sx={{ background: 'linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                <Typography variant={{ xs: 'subtitle1', sm: 'h6' }} sx={{ fontWeight: 600, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notifications color="warning" />
                  Health Impact Assessment
                </Typography>
                <Chip 
                  label={analyticsData?.healthImpact.riskLevel} 
                  color={analyticsData?.healthImpact.riskLevel === 'Good' ? 'success' : analyticsData?.healthImpact.riskLevel === 'Moderate' ? 'warning' : 'error'}
                />
              </Box>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Affected Population:</strong> {(analyticsData?.healthImpact.affectedPopulation / 1000000).toFixed(1)}M people
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Sensitive Groups:</strong> {(analyticsData?.healthImpact.sensitiveGroups / 1000).toFixed(0)}K people at higher risk
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      Health Metrics:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      <Chip label={`Respiratory: ${analyticsData?.healthImpact.healthMetrics.respiratoryIssues}%`} size="small" color="error" variant="outlined" />
                      <Chip label={`Cardiovascular: ${analyticsData?.healthImpact.healthMetrics.cardiovascularRisk}%`} size="small" color="warning" variant="outlined" />
                      <Chip label={`Allergies: ${analyticsData?.healthImpact.healthMetrics.allergicReactions}%`} size="small" color="info" variant="outlined" />
                      <Chip label={`Eye Irritation: ${analyticsData?.healthImpact.healthMetrics.eyeIrritation}%`} size="small" color="secondary" variant="outlined" />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Recommendations:
                  </Typography>
                  <Box>
                    {analyticsData?.healthImpact.recommendations.map((rec, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ fontSize: 16, color: '#4caf50', mr: 1 }} />
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}

      >
        <MenuItemComponent onClick={exportToExcel}>
          <ListItemIcon>
            <ExcelIcon fontSize="small" sx={{ color: '#4CAF50' }} />
          </ListItemIcon>
          <ListItemText primary="Export to Excel" />
        </MenuItemComponent>
        {/* <MenuItemComponent onClick={exportToPDF}>
          <ListItemIcon>
            <PdfIcon fontSize="small" sx={{ color: '#f44336' }} />
          </ListItemIcon>
          <ListItemText primary="Export to PDF" />
        </MenuItemComponent> */}
      </Menu>
    </Container>
  );
};

export default Analytics;