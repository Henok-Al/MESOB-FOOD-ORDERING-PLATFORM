import { createTheme, alpha } from '@mui/material/styles';

// Premium Color Palette - Aligned with Admin Dashboard
const primaryColor = '#0ea5e9'; // Sky Blue (matches admin primary-500)
const secondaryColor = '#ec4899'; // Pink (matches admin secondary-500)
const successColor = '#10b981'; // Emerald Green
const warningColor = '#f59e0b'; // Amber (matches admin accent-400)
const errorColor = '#ef4444'; // Red

export const getTheme = (darkMode: boolean) => createTheme({
    palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
            main: primaryColor,
            light: alpha(primaryColor, 0.8),
            dark: '#0284c7',
            contrastText: '#fff',
        },
        secondary: {
            main: secondaryColor,
            light: '#f9a8d4',
            dark: '#db2777',
            contrastText: '#fff',
        },
        success: {
            main: successColor,
        },
        warning: {
            main: warningColor,
        },
        error: {
            main: errorColor,
        },
        background: {
            default: darkMode ? '#1a1a2e' : '#F5F6FA',
            paper: darkMode ? '#1a1a2e' : '#FFFFFF',
        },
        text: {
            primary: darkMode ? '#FFFFFF' : '#2D3436',
            secondary: darkMode ? '#B0B0C0' : '#636E72',
        },
        ...(darkMode && {
            divider: 'rgba(255, 255, 255, 0.12)',
        }),
    },
    typography: {
        fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '3.5rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px', // Pill shape buttons
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: darkMode
                            ? '0 4px 12px rgba(255, 255, 255, 0.1)'
                            : '0 4px 12px rgba(255, 75, 43, 0.2)',
                    },
                },
                containedPrimary: {
                    background: `linear-gradient(45deg, ${primaryColor} 30%, ${secondaryColor} 90%)`,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: darkMode
                        ? '0 10px 40px -10px rgba(0, 0, 0, 0.3)'
                        : '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F9F9F9',
                        '& fieldset': {
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : '#E0E0E0',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                        },
                    },
                },
            },
        },
    },
});

// Export default theme for backward compatibility
export const theme = getTheme(false);
