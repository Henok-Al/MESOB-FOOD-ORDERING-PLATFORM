import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import AddressManager from '../components/AddressManager';

const Addresses: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Addresses
        </Typography>
        <AddressManager />
      </Container>
    </Box>
  );
};

export default Addresses;
