# AQI Monitoring System

A comprehensive real-time Air Quality Index (AQI) monitoring system that tracks multiple air pollutants, calculates AQI values, and provides alerts based on air quality thresholds.

## Features

### Core Features
- **Real-time Air Quality Monitoring**: Track PM2.5, PM10, CO, NO2, SO2, and O3 levels from multiple sensor locations
- **AQI Calculation**: Automatic calculation of Air Quality Index based on EPA standards
- **Live Dashboard**: Interactive dashboard with real-time updates via WebSocket connections
- **Multi-location Support**: Monitor air quality across multiple locations and cities
- **Alert System**: Configurable alerts for air quality threshold violations
- **Historical Data Analytics**: Visualize trends and patterns in air quality data
- **Report Generation**: Generate PDF and Excel reports for air quality data
- **Sensor Management**: Monitor sensor status and maintenance schedules

### Data Visualization
- Real-time AQI status indicators
- Pollutant concentration charts
- Historical trend analysis
- Comparative analytics across locations
- Interactive data filtering and time range selection

### Alert Management
- AQI threshold alerts
- Pollutant spike detection
- Sensor offline notifications
- Customizable notification preferences
- Alert acknowledgment system

## Technology Stack

### Backend
- **Framework**: Django 4.2.7
- **API**: Django REST Framework 3.14.0
- **Real-time Communication**: Django Channels 4.0.0 with WebSockets
- **Task Queue**: Celery 5.3.4 with Redis
- **Database**: SQLite (development) / PostgreSQL (production)
- **Server**: Daphne 4.0.0 (ASGI server)

### Frontend
- **Framework**: React 18.2.0
- **State Management**: Redux Toolkit 1.9.7
- **Routing**: React Router DOM 6.18.0
- **UI Library**: Material-UI 5.14.18
- **Charts**: Chart.js 4.4.0, Recharts 2.8.0
- **Styling**: Tailwind CSS 3.3.5
- **Real-time Updates**: React WebSocket hooks
- **HTTP Client**: Axios 1.6.0

## Project Structure

```
AQI-MONITORING-SYSTEM/
├── backend/
│   ├── aqi_backend/          # Django project settings
│   ├── monitoring/           # Core monitoring app (models, views, API)
│   ├── sensors/              # Sensor management endpoints
│   ├── analytics/            # Analytics and reporting endpoints
│   ├── calculate_aqi.py      # Standalone AQI calculation script
│   ├── fix_views.py          # Utility script
│   ├── manage.py             # Django management script
│   ├── requirements.txt      # Python dependencies
│   └── db.sqlite3            # SQLite database (development)
│
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── pages/            # Page components (Dashboard, Sensors, etc.)
    │   ├── services/         # API and WebSocket services
    │   ├── store/            # Redux store and slices
    │   └── App.js            # Main application component
    ├── public/               # Static assets
    ├── package.json          # Node.js dependencies
    └── tailwind.config.js    # Tailwind CSS configuration
```

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Redis server (for Celery and Channels)
- PostgreSQL (optional, for production)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshchi19/AQI-MONITORING-SYSTEM.git
   cd AQI-MONITORING-SYSTEM/backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=sqlite:///db.sqlite3
   REDIS_URL=redis://localhost:6379
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Redis server**
   ```bash
   redis-server
   ```

8. **Start Celery worker (in a separate terminal)**
   ```bash
   celery -A aqi_backend worker -l info
   ```

9. **Run the development server**
   ```bash
   python manage.py runserver
   ```

   Or use Daphne for ASGI support:
   ```bash
   daphne -b 0.0.0.0 -p 8000 aqi_backend.asgi:application
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WS_URL=ws://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Usage

### Accessing the Application
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin

### Key Pages
- **Dashboard**: Overview of all monitoring locations with real-time AQI data
- **Sensors**: Manage and monitor sensor status and configurations
- **Analytics**: Visualize historical data and trends
- **Alerts**: View and manage air quality alerts
- **Reports**: Generate and download air quality reports

### API Endpoints

#### Monitoring Endpoints
- `GET /api/locations/` - List all monitoring locations
- `GET /api/locations/{id}/` - Get location details
- `GET /api/sensors/` - List all sensors
- `GET /api/sensors/{id}/readings/` - Get sensor readings
- `GET /api/aqi/latest/` - Get latest AQI calculations
- `GET /api/alerts/` - List alerts

#### WebSocket Endpoints
- `ws://localhost:8000/ws/monitoring/` - Real-time sensor data updates
- `ws://localhost:8000/ws/alerts/` - Real-time alert notifications

### Running AQI Calculations

To manually calculate AQI for existing sensor readings:
```bash
python calculate_aqi.py
```

## Data Models

### Key Models
- **Location**: Stores monitoring location information
- **Sensor**: Tracks sensor devices and their status
- **SensorReading**: Raw pollutant measurements from sensors
- **AQICalculation**: Calculated AQI values and status
- **Alert**: Air quality alerts and notifications
- **UserPreference**: User-specific alert thresholds and notification settings

## Configuration

### AQI Thresholds
The system uses EPA's Air Quality Index standards:
- **Good** (0-50): Green
- **Moderate** (51-100): Yellow
- **Unhealthy for Sensitive Groups** (101-150): Orange
- **Unhealthy** (151-200): Red
- **Very Unhealthy** (201-300): Purple
- **Hazardous** (301+): Maroon

### Alert Configuration
Alerts can be configured based on:
- Overall AQI thresholds
- Individual pollutant levels
- Sensor status changes
- Data anomalies

## Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Building for Production

#### Backend
```bash
# Collect static files
python manage.py collectstatic

# Use production-ready ASGI server
daphne -b 0.0.0.0 -p 8000 aqi_backend.asgi:application
```

#### Frontend
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Acknowledgments

- EPA Air Quality Index standards and calculations
- Django and React communities for excellent documentation and tools
- Contributors and maintainers of all the open-source libraries used in this project
