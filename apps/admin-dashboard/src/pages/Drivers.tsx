import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Search,
  Edit,
  Block,
  CheckCircle,
  Star,
  TwoWheeler,
} from '@mui/icons-material';
import api from '../services/api';

interface Driver {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  driverProfile?: {
    isAvailable?: boolean;
    vehicleType?: string;
    licensePlate?: string;
    totalDeliveries?: number;
    rating?: number;
  };
  createdAt: string;
}

const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/drivers');
      setDrivers(response.data.data.drivers);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      // Mock data for demo
      setDrivers([
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          isActive: true,
          driverProfile: {
            isAvailable: true,
            vehicleType: 'car',
            licensePlate: 'ABC-123',
            totalDeliveries: 150,
            rating: 4.8,
          },
          createdAt: '2024-01-15',
        },
        {
          _id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          isActive: true,
          driverProfile: {
            isAvailable: false,
            vehicleType: 'motorcycle',
            licensePlate: 'XYZ-789',
            totalDeliveries: 89,
            rating: 4.9,
          },
          createdAt: '2024-02-20',
        },
        {
          _id: '3',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@example.com',
          phone: '+1234567892',
          isActive: false,
          driverProfile: {
            isAvailable: false,
            vehicleType: 'car',
            licensePlate: 'DEF-456',
            totalDeliveries: 45,
            rating: 4.5,
          },
          createdAt: '2024-03-10',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (driverId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/drivers/${driverId}`, { isActive: !currentStatus });
      setDrivers(drivers.map(d => 
        d._id === driverId ? { ...d, isActive: !currentStatus } : d
      ));
    } catch (error) {
      console.error('Failed to update driver:', error);
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    `${driver.firstName} ${driver.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.isActive).length,
    online: drivers.filter(d => d.driverProfile?.isAvailable).length,
    avgRating: drivers.reduce((sum, d) => sum + (d.driverProfile?.rating || 0), 0) / drivers.length || 0,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Driver Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Drivers
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Drivers
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Currently Online
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {stats.online}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Rating
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h3" fontWeight="bold">
                  {stats.avgRating.toFixed(1)}
                </Typography>
                <Star color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search drivers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Drivers Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Driver</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((driver) => (
              <TableRow key={driver._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {driver.firstName[0]}{driver.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold">
                        {driver.firstName} {driver.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Joined {new Date(driver.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{driver.email}</Typography>
                  <Typography variant="caption" color="text.secondary">{driver.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TwoWheeler fontSize="small" />
                    <Typography variant="body2" textTransform="capitalize">
                      {driver.driverProfile?.vehicleType || 'N/A'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {driver.driverProfile?.licensePlate || 'No plate'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {driver.driverProfile?.totalDeliveries || 0} deliveries
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={driver.isActive ? 'Active' : 'Inactive'}
                      color={driver.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={driver.driverProfile?.isAvailable ? 'Online' : 'Offline'}
                      color={driver.driverProfile?.isAvailable ? 'primary' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Star fontSize="small" color="warning" />
                    <Typography fontWeight="bold">
                      {driver.driverProfile?.rating?.toFixed(1) || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => {
                      setSelectedDriver(driver);
                      setDetailsOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleToggleActive(driver._id, driver.isActive)}
                    color={driver.isActive ? 'error' : 'success'}
                  >
                    {driver.isActive ? <Block /> : <CheckCircle />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Driver Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Driver Details
        </DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Box sx={{ pt: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24 }}>
                  {selectedDriver.firstName[0]}{selectedDriver.lastName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedDriver.email}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedDriver.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Vehicle Type</Typography>
                  <Typography variant="body1" textTransform="capitalize">
                    {selectedDriver.driverProfile?.vehicleType || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">License Plate</Typography>
                  <Typography variant="body1">
                    {selectedDriver.driverProfile?.licensePlate || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Total Deliveries</Typography>
                  <Typography variant="body1">
                    {selectedDriver.driverProfile?.totalDeliveries || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Rating</Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Star fontSize="small" color="warning" />
                    <Typography variant="body1" fontWeight="bold">
                      {selectedDriver.driverProfile?.rating?.toFixed(1) || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Member Since</Typography>
                  <Typography variant="body1">
                    {new Date(selectedDriver.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Drivers;
