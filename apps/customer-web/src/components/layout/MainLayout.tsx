import React from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import Navbar from './Navbar';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                background: (theme) => theme.palette.background.default,
                backgroundImage: `
                    radial-gradient(circle at 22% 16%, rgba(225,25,49,0.12), transparent 32%),
                    radial-gradient(circle at 78% 4%, rgba(240,197,66,0.1), transparent 30%)`,
            }}
        >
            <Navbar />
            <Box component="main" sx={{
                flex: 1,
                pt: 10,
                pb: 6,
                background: 'transparent',
            }}>
                <Container maxWidth="xl" sx={{
                    py: 4,
                    minHeight: 'calc(100vh - 80px)',
                }}>
                    {children}
                </Container>
            </Box>
        </Box>
    );
};

export default MainLayout;
