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
                backgroundImage: (theme) => `
                    radial-gradient(circle at 20% 15%, rgba(213,159,101,0.14), transparent 30%),
                    radial-gradient(circle at 80% 10%, rgba(44,26,18,0.08), transparent 24%),
                    radial-gradient(circle at 50% 80%, rgba(44,26,18,0.06), transparent 35%)`,
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
