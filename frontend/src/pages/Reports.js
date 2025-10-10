import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
// Date picker imports removed - using TextField for date inputs instead
import { Download, TableChart, Delete, Refresh, Info } from '@mui/icons-material';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [location, setLocation] = useState('all');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [reports, setReports] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([
    { id: 'all', name: 'All Locations' },
    { id: '1', name: 'Downtown' },
    { id: '2', name: 'Industrial Area' },
    { id: '3', name: 'Residential Zone' },
    { id: '4', name: 'Commercial District' }
  ]);

  useEffect(() => {
    // Fetch available locations
    const fetchLocations = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await api.get('/locations');
        // setAvailableLocations(response.data);
        
        // Mock data for now
        setAvailableLocations([
          { id: 'all', name: 'All Locations' },
          { id: '1', name: 'Downtown' },
          { id: '2', name: 'Industrial Area' },
          { id: '3', name: 'Residential Zone' },
          { id: '4', name: 'Commercial District' }
        ]);
      } catch (err) {
        setError('Failed to fetch locations');
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    // Fetch existing reports
    const fetchReports = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const response = await api.get('/reports');
        // setReports(response.data);
        
        // Mock data for now
        setTimeout(() => {
          setReports([
            {
              id: 1,
              name: 'Daily AQI Report - Downtown',
              type: 'daily',
              location: 'Downtown',
              dateRange: '2024-01-07 to 2024-01-07',
              status: 'completed',
              createdAt: '2024-01-08T10:30:00Z',
              fileSize: '2.3 MB'
            },
            {
              id: 2,
              name: 'Weekly Pollution Summary',
              type: 'weekly',
              location: 'All Locations',
              dateRange: '2024-01-01 to 2024-01-07',
              status: 'completed',
              createdAt: '2024-01-08T09:15:00Z',
              fileSize: '5.7 MB'
            },
            {
              id: 3,
              name: 'Monthly Air Quality Analysis',
              type: 'monthly',
              location: 'Industrial Area',
              dateRange: '2023-12-01 to 2023-12-31',
              status: 'completed',
              createdAt: '2024-01-08T08:00:00Z',
              fileSize: '8.1 MB'
            },
            {
              id: 4,
              name: 'Quarterly Environmental Assessment',
              type: 'custom',
              location: 'Commercial District',
              dateRange: '2023-10-01 to 2023-12-31',
              status: 'completed',
              createdAt: '2024-01-05T14:20:00Z',
              fileSize: '12.5 MB'
            },
            {
              id: 5,
              name: 'Real-time Data Summary',
              type: 'daily',
              location: 'Residential Zone',
              dateRange: '2024-01-06 to 2024-01-06',
              status: 'completed',
              createdAt: '2024-01-07T16:45:00Z',
              fileSize: '1.8 MB'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate report generation process
      setTimeout(() => {
        const locationName = location === 'all' ? 'All Locations' : (availableLocations.find(l => l.id === location)?.name || 'Unknown Location');
        
        // Generate random file size based on report type
        const getFileSize = (type) => {
          const baseSizes = {
            daily: Math.random() * (3 - 1) + 1, // 1-3 MB
            weekly: Math.random() * (8 - 4) + 4, // 4-8 MB
            monthly: Math.random() * (15 - 8) + 8, // 8-15 MB
            custom: Math.random() * (20 - 5) + 5 // 5-20 MB
          };
          return `${baseSizes[type]?.toFixed(1) || '2.5'} MB`;
        };
        
        const newReport = {
          id: Date.now(), // Use timestamp as unique ID
          name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${locationName}`,
          type: reportType,
          location: locationName,
          dateRange: `${startDate ? startDate.toISOString().split('T')[0] : ''} to ${endDate ? endDate.toISOString().split('T')[0] : ''}`,
          status: 'completed', // Always completed now
          createdAt: new Date().toISOString(),
          fileSize: getFileSize(reportType)
        };
        
        setReports([newReport, ...reports]);
        setLoading(false);
        
        // Show success message
        setTimeout(() => {
          alert(`Report "${newReport.name}" generated successfully!`);
        }, 100);
      }, 1500); // Reduced time for better UX
    } catch (err) {
      setError('Failed to generate report');
      setLoading(false);
    }
  };

  const generateReportData = (report) => {
    // Generate comprehensive mock data for the report
    const currentDate = new Date().toLocaleDateString();
    const locations = ['Downtown', 'Industrial Area', 'Residential Zone', 'Commercial District'];
    
    // Generate random but realistic AQI data
    const generateAQIData = () => {
      return locations.map(location => ({
        location,
        aqi: Math.floor(Math.random() * 200) + 50, // 50-250 AQI
        pm25: Math.floor(Math.random() * 75) + 15, // 15-90 µg/m³
        pm10: Math.floor(Math.random() * 100) + 25, // 25-125 µg/m³
        co: (Math.random() * 15 + 5).toFixed(1), // 5-20 mg/m³
        no2: Math.floor(Math.random() * 80) + 20, // 20-100 µg/m³
        so2: Math.floor(Math.random() * 50) + 10, // 10-60 µg/m³
        o3: Math.floor(Math.random() * 120) + 30, // 30-150 µg/m³
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString()
      }));
    };

    const data = generateAQIData();
    
    return {
      reportInfo: {
        name: report.name,
        type: report.type,
        location: report.location,
        dateRange: report.dateRange,
        generatedOn: currentDate,
        status: report.status,
        fileSize: report.fileSize
      },
      summary: {
        avgAQI: Math.floor(data.reduce((sum, d) => sum + d.aqi, 0) / data.length),
        maxAQI: Math.max(...data.map(d => d.aqi)),
        minAQI: Math.min(...data.map(d => d.aqi)),
        totalLocations: data.length,
        criticalAlerts: data.filter(d => d.aqi > 150).length,
        healthyReadings: data.filter(d => d.aqi <= 100).length
      },
      detailedData: data,
      recommendations: [
        'Monitor PM2.5 levels closely in industrial areas',
        'Consider air purification systems for indoor spaces',
        'Limit outdoor activities during high AQI periods',
        'Increase green spaces to improve air quality',
        'Regular maintenance of monitoring equipment recommended'
      ]
    };
  };

  const handleDownloadReport = (reportId, format) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      setError('Report not found');
      return;
    }

    const reportData = generateReportData(report);
    const fileName = `${report.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.${format}`;
    
    if (format === 'pdf') {
      // Create a beautifully formatted HTML file that can be easily converted to PDF
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportData.reportInfo.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50;
            background: #f8f9fa;
            padding: 20px;
        }
        .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            background: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header h2 { font-size: 1.5em; margin-bottom: 10px; font-weight: 300; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section-title { 
            font-size: 1.4em; 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px;
        }
        .info-card { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
            border-left: 5px solid #3498db;
            transition: transform 0.2s;
        }
        .info-card:hover { transform: translateY(-2px); }
        .info-card strong { color: #2c3e50; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 20px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .data-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .data-table th { 
            background: #34495e; 
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 500;
        }
        .data-table td { 
            padding: 12px;
            border-bottom: 1px solid #ecf0f1;
        }
        .data-table tr:hover { background: #f8f9fa; }
        .aqi-good { 
            color: #27ae60; 
            font-weight: bold; 
            background: #d5f4e6;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .aqi-moderate { 
            color: #f39c12; 
            font-weight: bold; 
            background: #fef5e7;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .aqi-unhealthy-sensitive { 
            color: #e67e22; 
            font-weight: bold; 
            background: #fdf2e9;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .aqi-unhealthy { 
            color: #e74c3c; 
            font-weight: bold; 
            background: #fdedec;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .recommendations { 
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 25px; 
            border-radius: 10px;
            border-left: 5px solid #2196f3;
        }
        .recommendations ol { margin-left: 20px; }
        .recommendations li { 
            margin-bottom: 10px;
            color: #1976d2;
        }
        .reference-table {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .footer { 
            background: #2c3e50;
            color: white;
            text-align: center; 
            padding: 30px;
            margin-top: 40px;
        }
        .footer h3 { margin-bottom: 10px; }
        .print-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .print-note { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌍 AQI MONITORING SYSTEM</h1>
            <h2>${reportData.reportInfo.name}</h2>
            <p>Generated on ${reportData.reportInfo.generatedOn}</p>
        </div>

        <div class="content">
            <div class="print-note">
                <strong>💡 Tip:</strong> To save as PDF, press Ctrl+P (Windows) or Cmd+P (Mac) and select "Save as PDF"
            </div>

            <div class="section">
                <div class="section-title">
                    📊 Report Information
                </div>
                <div class="info-grid">
                    <div class="info-card">
                        <strong>Report Type:</strong><br>
                        ${reportData.reportInfo.type.toUpperCase()}
                    </div>
                    <div class="info-card">
                        <strong>Location Coverage:</strong><br>
                        ${reportData.reportInfo.location}
                    </div>
                    <div class="info-card">
                        <strong>Date Range:</strong><br>
                        ${reportData.reportInfo.dateRange}
                    </div>
                    <div class="info-card">
                        <strong>Report Status:</strong><br>
                        ${reportData.reportInfo.status.toUpperCase()}
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">
                    📈 Executive Summary
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number aqi-${reportData.summary.avgAQI <= 50 ? 'good' : reportData.summary.avgAQI <= 100 ? 'moderate' : reportData.summary.avgAQI <= 150 ? 'unhealthy-sensitive' : 'unhealthy'}">${reportData.summary.avgAQI}</div>
                        <div class="stat-label">Average AQI<br><small>(${reportData.summary.avgAQI <= 50 ? 'Good' : reportData.summary.avgAQI <= 100 ? 'Moderate' : reportData.summary.avgAQI <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'})</small></div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number aqi-unhealthy">${reportData.summary.maxAQI}</div>
                        <div class="stat-label">Maximum AQI</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number aqi-good">${reportData.summary.minAQI}</div>
                        <div class="stat-label">Minimum AQI</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" style="color: #3498db;">${reportData.summary.totalLocations}</div>
                        <div class="stat-label">Total Locations</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number aqi-unhealthy">${reportData.summary.criticalAlerts}</div>
                        <div class="stat-label">Critical Alerts</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number aqi-good">${reportData.summary.healthyReadings}</div>
                        <div class="stat-label">Healthy Readings</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">
                    🏭 Detailed Measurements
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>AQI</th>
                            <th>PM2.5<br><small>(µg/m³)</small></th>
                            <th>PM10<br><small>(µg/m³)</small></th>
                            <th>CO<br><small>(mg/m³)</small></th>
                            <th>NO2<br><small>(µg/m³)</small></th>
                            <th>SO2<br><small>(µg/m³)</small></th>
                            <th>O3<br><small>(µg/m³)</small></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.detailedData.map(location => `
                            <tr>
                                <td><strong>${location.location}</strong></td>
                                <td><span class="aqi-${location.aqi <= 50 ? 'good' : location.aqi <= 100 ? 'moderate' : location.aqi <= 150 ? 'unhealthy-sensitive' : 'unhealthy'}">${location.aqi}</span></td>
                                <td>${location.pm25}</td>
                                <td>${location.pm10}</td>
                                <td>${location.co}</td>
                                <td>${location.no2}</td>
                                <td>${location.so2}</td>
                                <td>${location.o3}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <div class="section-title">
                    🏥 Health Recommendations
                </div>
                <div class="recommendations">
                    <ol>
                        ${reportData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ol>
                </div>
            </div>

            <div class="section">
                <div class="section-title">
                    📋 AQI Scale Reference
                </div>
                <div class="reference-table">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>AQI Range</th>
                                <th>Level</th>
                                <th>Health Implications</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td><span class="aqi-good">0-50</span></td><td>Good</td><td>Air quality is considered satisfactory</td></tr>
                            <tr><td><span class="aqi-moderate">51-100</span></td><td>Moderate</td><td>Air quality is acceptable for most people</td></tr>
                            <tr><td><span class="aqi-unhealthy-sensitive">101-150</span></td><td>Unhealthy for Sensitive Groups</td><td>Sensitive individuals may experience problems</td></tr>
                            <tr><td><span class="aqi-unhealthy">151-200</span></td><td>Unhealthy</td><td>Everyone may begin to experience health effects</td></tr>
                            <tr><td style="color: #8e44ad; font-weight: bold; background: #f4ecf7; padding: 4px 8px; border-radius: 4px;">201-300</td><td>Very Unhealthy</td><td>Health warnings of emergency conditions</td></tr>
                            <tr><td style="color: #a0522d; font-weight: bold; background: #fdf5e6; padding: 4px 8px; border-radius: 4px;">301+</td><td>Hazardous</td><td>Health alert - serious effects for everyone</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer">
            <h3>🌍 AQI Monitoring System</h3>
            <p>© 2024 Environmental Monitoring Solutions</p>
            <p>📧 Contact: support@aqimonitor.com | 🌐 www.aqimonitor.com</p>
        </div>
    </div>
</body>
</html>`;

      // Create and download HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.pdf', '.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } else if (format === 'excel') {
      // Generate comprehensive Excel CSV content
      const csvContent = `AQI MONITORING SYSTEM - ${reportData.reportInfo.name.toUpperCase()}
Generated On: ${reportData.reportInfo.generatedOn}
Report Type: ${reportData.reportInfo.type}
Date Range: ${reportData.reportInfo.dateRange}
Location Coverage: ${reportData.reportInfo.location}

EXECUTIVE SUMMARY
Metric,Value,Unit
Average AQI,${reportData.summary.avgAQI},Index
Maximum AQI,${reportData.summary.maxAQI},Index
Minimum AQI,${reportData.summary.minAQI},Index
Total Locations,${reportData.summary.totalLocations},Count
Critical Alerts,${reportData.summary.criticalAlerts},Count
Healthy Readings,${reportData.summary.healthyReadings},Count

DETAILED MEASUREMENTS
Location,AQI,AQI Status,PM2.5 (µg/m³),PM10 (µg/m³),CO (mg/m³),NO2 (µg/m³),SO2 (µg/m³),O3 (µg/m³),Last Updated
${reportData.detailedData.map(d => 
  `${d.location},${d.aqi},${d.aqi <= 50 ? 'Good' : d.aqi <= 100 ? 'Moderate' : d.aqi <= 150 ? 'Unhealthy for Sensitive' : 'Unhealthy'},${d.pm25},${d.pm10},${d.co},${d.no2},${d.so2},${d.o3},"${d.timestamp}"`
).join('\n')}

POLLUTANT ANALYSIS
Pollutant,Average,Maximum,Minimum,WHO Guideline,Status
PM2.5,${(reportData.detailedData.reduce((sum, d) => sum + d.pm25, 0) / reportData.detailedData.length).toFixed(1)},${Math.max(...reportData.detailedData.map(d => d.pm25))},${Math.min(...reportData.detailedData.map(d => d.pm25))},15,${(reportData.detailedData.reduce((sum, d) => sum + d.pm25, 0) / reportData.detailedData.length) > 15 ? 'EXCEEDS' : 'WITHIN'}
PM10,${(reportData.detailedData.reduce((sum, d) => sum + d.pm10, 0) / reportData.detailedData.length).toFixed(1)},${Math.max(...reportData.detailedData.map(d => d.pm10))},${Math.min(...reportData.detailedData.map(d => d.pm10))},45,${(reportData.detailedData.reduce((sum, d) => sum + d.pm10, 0) / reportData.detailedData.length) > 45 ? 'EXCEEDS' : 'WITHIN'}
NO2,${(reportData.detailedData.reduce((sum, d) => sum + d.no2, 0) / reportData.detailedData.length).toFixed(1)},${Math.max(...reportData.detailedData.map(d => d.no2))},${Math.min(...reportData.detailedData.map(d => d.no2))},25,${(reportData.detailedData.reduce((sum, d) => sum + d.no2, 0) / reportData.detailedData.length) > 25 ? 'EXCEEDS' : 'WITHIN'}

HEALTH RECOMMENDATIONS
${reportData.recommendations.map((rec, index) => `${index + 1},"${rec}"`).join('\n')}

AQI REFERENCE SCALE
AQI Range,Level,Color,Health Implications
0-50,Good,Green,Air quality is considered satisfactory
51-100,Moderate,Yellow,Air quality is acceptable for most people
101-150,Unhealthy for Sensitive Groups,Orange,Sensitive individuals may experience problems
151-200,Unhealthy,Red,Everyone may begin to experience health effects
201-300,Very Unhealthy,Purple,Health warnings of emergency conditions
301+,Hazardous,Maroon,Health alert - everyone may experience serious effects`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace('.excel', '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    // Show success message
    setTimeout(() => {
      alert(`✅ Download completed: ${fileName}\n\nThe file contains:\n• Detailed AQI measurements\n• Health recommendations\n• Pollutant analysis\n• Reference scales\n\nFile saved to your Downloads folder!`);
    }, 100);
  };

  const handleDeleteReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      setReports(reports.filter(r => r.id !== reportId));
      setTimeout(() => {
        alert('Report deleted successfully!');
      }, 100);
    }
  };

  const handleRefreshReports = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate refreshing - you could re-fetch data here
      setLoading(false);
      alert('Reports refreshed successfully!');
    }, 1000);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: { label: 'Ready', color: 'success' },
      processing: { label: 'Processing', color: 'warning' },
      failed: { label: 'Failed', color: 'error' },
      ready: { label: 'Ready', color: 'success' }
    };
    
    const config = statusConfig[status] || { label: 'Ready', color: 'success' };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {reports.length}
                </Typography>
                <Typography variant="body2">
                  Total Reports
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {reports.filter(r => r.status === 'completed').length}
                </Typography>
                <Typography variant="body2">
                  Ready for Download
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {new Set(reports.map(r => r.type)).size}
                </Typography>
                <Typography variant="body2">
                  Report Types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  {new Set(reports.map(r => r.location)).size}
                </Typography>
                <Typography variant="body2">
                  Locations Covered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Report Generation Form */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>
            
            {reportType && location && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Ready to generate {reportType} report for {location === 'all' ? 'All Locations' : availableLocations.find(l => l.id === location)?.name}
                {startDate && endDate && ` from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                  >
                    <MenuItem value="daily">Daily Summary</MenuItem>
                    <MenuItem value="weekly">Weekly Analysis</MenuItem>
                    <MenuItem value="monthly">Monthly Report</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    label="Location"
                  >
                    {(availableLocations || []).map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    try {
                      setStartDate(new Date(e.target.value));
                    } catch (error) {
                      console.error('Invalid start date:', error);
                    }
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    try {
                      setEndDate(new Date(e.target.value));
                    } catch (error) {
                      console.error('Invalid end date:', error);
                    }
                  }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={loading || !reportType || !location}
                  fullWidth
                  sx={{ 
                    height: '56px',
                    background: loading ? 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(33, 150, 243, 0.4)'
                    }
                  }}
                >
                  {loading ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircularProgress size={20} color="inherit" />
                      Processing...
                    </Box>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Reports List */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Generated Reports ({reports.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefreshReports}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No reports generated yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    (reports || []).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>
                          <Chip label={report.type} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>{report.location}</TableCell>
                        <TableCell>{report.dateRange}</TableCell>
                        <TableCell>{getStatusChip(report.status)}</TableCell>
                        <TableCell>
                          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>{report.fileSize || '-'}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<Download />}
                              onClick={() => handleDownloadReport(report.id, 'pdf')}
                              sx={{ minWidth: '70px' }}
                            >
                              PDF
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<TableChart />}
                              onClick={() => handleDownloadReport(report.id, 'excel')}
                              sx={{ minWidth: '70px' }}
                            >
                              Excel
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteReport(report.id)}
                              sx={{ minWidth: '70px' }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
  );
};

export default Reports;