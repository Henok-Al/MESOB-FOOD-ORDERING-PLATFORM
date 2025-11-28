import { createTheme, alpha } from '@mui/material/styles';

// Premium Color Palette
const primaryColor = '#FF4B2B'; // Vibrant Orange-Red
const secondaryColor = '#2D3436'; // Dark Slate
const successColor = '#00B894'; // Mint Green
const warningColor = '#FDCB6E'; // Mustard Yellow
const errorColor = '#D63031'; // Bright Red

export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor,
            light: alpha(primaryColor, 0.8),
            dark: '#E84118',
            contrastText: '#fff',
        },
        secondary: {
            main: secondaryColor,
            light: '#636E72',
            dark: '#1E272E',
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
            default: '#F5F6FA', // Light Grey Background
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2D3436',
            secondary: '#636E72',
        },
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
                        boxShadow: '0 4px 12px rgba(255, 75, 43, 0.2)',
                    },
                },
                containedPrimary: {
                    background: `linear-gradient(45deg, ${primaryColor} 30%, #FF416C 90%)`,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: '#F9F9F9',
                        '& fieldset': {
                            borderColor: 'transparent',
                        },
                        '&:hover fieldset': {
                            borderColor: '#E0E0E0',
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
