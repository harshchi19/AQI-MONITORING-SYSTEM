import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateRealTimeData } from '../store/dashboardSlice';
import { addNewAlert } from '../store/alertsSlice';
import { addRealtimeReading } from '../store/sensorsSlice';

export const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;
  const dispatch = useDispatch();

  const connect = () => {
    try {
      const wsUrl = url.startsWith('ws') ? url : `ws://localhost:8000${url}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'aqi_update':
              dispatch(updateRealTimeData({
                locationId: data.data.sensor_reading?.sensor?.location_id,
                data: data.data
              }));
              break;
            
            case 'new_alert':
              dispatch(addNewAlert(data.data));
              break;
            
            case 'sensor_reading':
              dispatch(addRealtimeReading({
                sensorId: data.data.sensor_id,
                reading: data.data
              }));
              break;
            
            default:
              // Handle other message types
              if (options.onMessage) {
                options.onMessage(data);
              }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current += 1;
            console.log(`Reconnection attempt ${reconnectAttempts.current}`);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(error);
      };

      setSocket(ws);
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(err);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Component unmounting');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }
  };

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;