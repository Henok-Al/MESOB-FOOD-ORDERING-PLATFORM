import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flex: 1, pt: 8, pb: 4 }}>
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;