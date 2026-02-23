import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn,
} from '@mui/icons-material';

interface DeliveryArea {
  id: string;
  name: string;
  city: string;
  deliveryFee: number;
  minOrderAmount: number;
  estimatedTime: number; // in minutes
  isActive: boolean;
  coordinates: {
    lat: number;
    lng: number;
    radius: number; // in km
  };
}

const initialAreas: DeliveryArea[] = [
  {
    id: '1',
    name: 'Bole Area',
    city: 'Addis Ababa',
    deliveryFee: 50,
    minOrderAmount: 200,
    estimatedTime: 25,
    isActive: true,
    coordinates: { lat: 8.9806, lng: 38.7578, radius: 3 },
  },
  {
    id: '2',
    name: 'Kazanchis',
    city: 'Addis Ababa',
    deliveryFee: 40,
    minOrderAmount: 150,
    estimatedTime: 20,
    isActive: true,
    coordinates: { lat: 9.0054, lng: 38.7631, radius: 2 },
  },
  {
    id: '3',
    name: 'Mexico Area',
    city: 'Addis Ababa',
    deliveryFee: 60,
    minOrderAmount: 250,
    estimatedTime: 30,
    isActive: true,
    coordinates: { lat: 8.9915, lng: 38.7423, radius: 2.5 },
  },
  {
    id: '4',
    name: 'Lebanon Street',
    city: 'Addis Ababa',
    deliveryFee: 35,
    minOrderAmount: 100,
    estimatedTime: 15,
    isActive: true,
    coordinates: { lat: 9.0089, lng: 38.7512, radius: 1.5 },
  },
  {
    id: '5',
    name: 'Ayat',
    city: 'Addis Ababa',
    deliveryFee: 75,
    minOrderAmount: 300,
    estimatedTime: 40,
    isActive: false,
    coordinates: { lat: 9.0201, lng: 38.7345, radius: 4 },
  },
];

export default function DeliveryAreas() {
  const [areas, setAreas] = useState<DeliveryArea[]>(initialAreas);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [formData, setFormData] = useState<Partial<DeliveryArea>>({
    name: '',
    city: 'Addis Ababa',
    deliveryFee: 50,
    minOrderAmount: 100,
    estimatedTime: 25,
    isActive: true,
    coordinates: { lat: 9.0, lng: 38.75, radius: 2 },
  });

  const handleOpenDialog = (area?: DeliveryArea) => {
    if (area) {
      setEditingArea(area);
      setFormData(area);
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        city: 'Addis Ababa',
        deliveryFee: 50,
        minOrderAmount: 100,
        estimatedTime: 25,
        isActive: true,
        coordinates: { lat: 9.0, lng: 38.75, radius: 2 },
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingArea(null);
  };

  const handleSave = () => {
    if (editingArea) {
      setAreas(areas.map(a => a.id === editingArea.id ? { ...a, ...formData } as DeliveryArea : a));
    } else {
      const newArea: DeliveryArea = {
        ...formData as DeliveryArea,
        id: Date.now().toString(),
      };
      setAreas([...areas, newArea]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this delivery area?')) {
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setAreas(areas.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          <LocationOn sx={{ mr: 1, verticalAlign: 'middle', color: '#f97316' }} />
          Delivery Areas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
        >
          Add Area
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Areas
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#f97316' }}>
              {areas.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Areas
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e' }}>
              {areas.filter(a => a.isActive).length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Avg. Delivery Fee
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6' }}>
              ETB {Math.round(areas.reduce((sum, a) => sum + a.deliveryFee, 0) / areas.length)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Areas Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Area Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Delivery Fee</TableCell>
                  <TableCell>Min. Order</TableCell>
                  <TableCell>Est. Time</TableCell>
                  <TableCell>Coverage</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {area.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{area.city}</TableCell>
                    <TableCell>
                      <Chip
                        label={`ETB ${area.deliveryFee}`}
                        size="small"
                        sx={{ bgcolor: '#dbeafe', color: '#2563eb' }}
                      />
                    </TableCell>
                    <TableCell>ETB {area.minOrderAmount}</TableCell>
                    <TableCell>{area.estimatedTime} min</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {area.coordinates.radius}km radius
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={area.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={area.isActive ? 'success' : 'default'}
                        onClick={() => handleToggleActive(area.id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(area)}
                        sx={{ color: '#3b82f6' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(area.id)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingArea ? 'Edit Delivery Area' : 'Add New Delivery Area'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Area Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bole Area"
            />
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Delivery Fee (ETB)"
                value={formData.deliveryFee}
                onChange={(e) => setFormData({ ...formData, deliveryFee: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                type="number"
                label="Min. Order (ETB)"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: parseInt(e.target.value) })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Estimated Time (min)"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
              />
              <TextField
                fullWidth
                type="number"
                label="Coverage Radius (km)"
                value={formData.coordinates?.radius}
                onChange={(e) => setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates!, radius: parseFloat(e.target.value) }
                })}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Latitude"
                value={formData.coordinates?.lat}
                onChange={(e) => setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates!, lat: parseFloat(e.target.value) }
                })}
              />
              <TextField
                fullWidth
                type="number"
                label="Longitude"
                value={formData.coordinates?.lng}
                onChange={(e) => setFormData({
                  ...formData,
                  coordinates: { ...formData.coordinates!, lng: parseFloat(e.target.value) }
                })}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
          >
            {editingArea ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
