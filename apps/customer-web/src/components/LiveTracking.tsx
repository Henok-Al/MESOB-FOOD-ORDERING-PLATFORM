import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  LocationOn,
  Speed,
  AccessTime,
  Phone,
  Navigation,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  lastUpdated: string;
}

interface LiveTrackingProps {
  orderId: string;
  apiBaseUrl: string;
}

const LiveTracking: React.FC<LiveTrackingProps> = ({ orderId, apiBaseUrl }) => {
  const [tracking, setTracking] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eta, setEta] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial tracking data
  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/tracking/order/${orderId}`);
        setTracking(response.data.data);
        setDriverLocation(response.data.data.location);
        setEta(response.data.data.eta);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load tracking');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  // Setup Socket.io for real-time updates
  useEffect(() => {
    if (!orderId || !apiBaseUrl) return;

    // Connect to Socket.io
    const socket = io(apiBaseUrl.replace('/api', ''), {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to tracking server');
      // Join order room
      socket.emit('joinOrder', orderId);
    });

    socket.on('driverLocation', (data: any) => {
      if (data.orderId === orderId) {
        setDriverLocation(data.location);
        // Update ETA based on new location
        if (data.eta) {
          setEta(data.eta);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from tracking server');
    });

    return () => {
      socket.emit('leaveOrder', orderId);
      socket.disconnect();
    };
  }, [orderId, apiBaseUrl]);

  // Calculate relative position for the map simulation
  const getMapPosition = () => {
    if (!driverLocation) return { x: 50, y: 50 };
    // This is a simplified visualization - in production, use a real map library
    // like Google Maps, Mapbox, or Leaflet
    return {
      x: 50 + (driverLocation.longitude % 0.01) * 1000,
      y: 50 + (driverLocation.latitude % 0.01) * 1000,
    };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready_for_pickup: 'primary',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ my: 2 }} />
        <Skeleton variant="text" width="80%" />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!tracking) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Tracking information not available</Typography>
      </Paper>
    );
  }

  const position = getMapPosition();

  return (
    <Box>
      {/* Status Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Order #{tracking.order?.orderNumber}
            </Typography>
            <Chip
              label={tracking.order?.status?.replace(/_/g, ' ')}
              color={getStatusColor(tracking.order?.status)}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          {eta && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {eta}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Estimated Arrival
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Live Map Simulation */}
      <Paper
        sx={{
          height: 300,
          mb: 2,
          position: 'relative',
          bgcolor: '#e3f2fd',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* Simulated Map Background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Restaurant Marker */}
        <Box
          sx={{
            position: 'absolute',
            left: '20%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <LocationOn color="error" sx={{ fontSize: 40 }} />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              bgcolor: 'white',
              px: 1,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            {tracking.restaurant?.name || 'Restaurant'}
          </Typography>
        </Box>

        {/* Destination Marker */}
        <Box
          sx={{
            position: 'absolute',
            right: '20%',
            bottom: '30%',
            transform: 'translate(50%, 50%)',
          }}
        >
          <LocationOn color="success" sx={{ fontSize: 40 }} />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              bgcolor: 'white',
              px: 1,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            Your Location
          </Typography>
        </Box>

        {/* Driver Marker */}
        {driverLocation && (
          <Box
            sx={{
              position: 'absolute',
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%) rotate(${driverLocation.heading || 0}deg)`,
              transition: 'all 2s ease-out',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 3,
                border: '3px solid white',
              }}
            >
              <Navigation sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                bgcolor: 'primary.main',
                color: 'white',
                px: 1,
                borderRadius: 1,
                fontWeight: 'bold',
              }}
            >
              Driver
            </Typography>
          </Box>
        )}

        {/* Connection Line (simulated route) */}
        <Box
          sx={{
            position: 'absolute',
            left: '20%',
            top: '30%',
            right: '20%',
            bottom: '30%',
            borderTop: '3px dashed',
            borderColor: 'grey.400',
            transform: 'rotate(15deg)',
            transformOrigin: 'left center',
          }}
        />
      </Paper>

      {/* Driver Info Card */}
      {tracking.driver && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={tracking.driver.avatar} sx={{ width: 60, height: 60 }}>
                {tracking.driver.name?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  {tracking.driver.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your Delivery Partner
                </Typography>
              </Box>
              <Box
                component="a"
                href={`tel:${tracking.driver.phone}`}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 1,
                  borderRadius: '50%',
                  display: 'flex',
                  textDecoration: 'none',
                }}
              >
                <Phone />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Location Stats */}
            {driverLocation && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                {driverLocation.speed !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Speed color="action" />
                    <Typography variant="body2">
                      {driverLocation.speed > 0 ? `${Math.round(driverLocation.speed)} km/h` : 'Stopped'}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="action" />
                  <Typography variant="body2">
                    Updated {new Date(driverLocation.lastUpdated).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tracking Legend */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tracking Information
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOn />}
            label={`Lat: ${driverLocation?.latitude.toFixed(4) || 'N/A'}`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<LocationOn />}
            label={`Lng: ${driverLocation?.longitude.toFixed(4) || 'N/A'}`}
            size="small"
            variant="outlined"
          />
          {tracking.distance && (
            <Chip
              label={`${tracking.distance} away`}
              size="small"
              color="primary"
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LiveTracking;
