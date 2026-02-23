import { createTheme } from '@mui/material/styles';
import { FRANK_COLORS } from '@food-ordering/constants';

// FRANK by БАСТА - Official Design System
// Dark theme with orange accents
export const getTheme = (darkMode: boolean = true) => createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: FRANK_COLORS.orange,
            dark: FRANK_COLORS.orangeDark,
            light: FRANK_COLORS.orangeLight,
            contrastText: '#fff',
        },
        secondary: {
            main: FRANK_COLORS.success,
            contrastText: '#fff',
        },
        success: { main: FRANK_COLORS.success },
        warning: { main: FRANK_COLORS.warning },
        error: { main: FRANK_COLORS.error },
        background: {
            default: FRANK_COLORS.bgPrimary,
            paper: FRANK_COLORS.bgCard,
        },
        text: {
            primary: FRANK_COLORS.textPrimary,
            secondary: FRANK_COLORS.textSecondary,
            disabled: FRANK_COLORS.textMuted,
        },
        divider: FRANK_COLORS.border,
    },
    typography: {
        fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", Arial, sans-serif',
        h1: { 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            fontSize: '3rem', 
            lineHeight: 1.1,
            textTransform: 'uppercase',
        },
        h2: { 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            fontSize: '2.25rem', 
            lineHeight: 1.2,
            textTransform: 'uppercase',
        },
        h3: { 
            fontWeight: 700, 
            letterSpacing: '-0.01em', 
            fontSize: '1.75rem', 
            lineHeight: 1.2,
            textTransform: 'uppercase',
        },
        h4: { 
            fontWeight: 700, 
            fontSize: '1.5rem', 
            lineHeight: 1.3,
            textTransform: 'uppercase',
        },
        h5: { 
            fontWeight: 700, 
            fontSize: '1.25rem', 
            lineHeight: 1.4,
            textTransform: 'uppercase',
        },
        h6: { 
            fontWeight: 600, 
            fontSize: '1rem', 
            lineHeight: 1.4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        body1: { 
            fontWeight: 400, 
            fontSize: '1rem', 
            lineHeight: 1.6,
        },
        body2: { 
            fontWeight: 400, 
            fontSize: '0.875rem', 
            lineHeight: 1.5,
        },
        button: { 
            fontWeight: 700, 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        overline: { 
            letterSpacing: '0.1em', 
            fontWeight: 700,
            textTransform: 'uppercase',
        },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body {
                    background: ${FRANK_COLORS.bgPrimary};
                    color: ${FRANK_COLORS.textPrimary};
                }
                ::selection {
                    background: ${FRANK_COLORS.orange};
                    color: #fff;
                }
                * {
                    scrollbar-width: thin;
                    scrollbar-color: ${FRANK_COLORS.orange} ${FRANK_COLORS.bgSecondary};
                }
                *::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                *::-webkit-scrollbar-track {
                    background: ${FRANK_COLORS.bgSecondary};
                }
                *::-webkit-scrollbar-thumb {
                    background: ${FRANK_COLORS.orange};
                    border-radius: 4px;
                }
            `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '12px 24px',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                        transform: 'translateY(-2px)', 
                        boxShadow: `0 8px 20px ${FRANK_COLORS.orange}40`,
                    },
                },
                containedPrimary: {
                    background: FRANK_COLORS.orange,
                    '&:hover': { 
                        background: FRANK_COLORS.orangeLight,
                    },
                },
                containedSecondary: {
                    background: FRANK_COLORS.bgElevated,
                    color: FRANK_COLORS.textPrimary,
                    '&:hover': { 
                        background: FRANK_COLORS.border,
                    },
                },
                outlined: {
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: FRANK_COLORS.border,
                    '&:hover': { 
                        borderColor: FRANK_COLORS.orange, 
                        background: `${FRANK_COLORS.orange}10`,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${FRANK_COLORS.border}`,
                    background: FRANK_COLORS.bgCard,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${FRANK_COLORS.border}`,
                    background: FRANK_COLORS.bgCard,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 20px 40px rgba(0,0,0,0.4)`,
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: FRANK_COLORS.bgSecondary,
                        border: `1px solid ${FRANK_COLORS.border}`,
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: FRANK_COLORS.borderLight },
                        '&.Mui-focused fieldset': { 
                            borderColor: FRANK_COLORS.orange, 
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: `${FRANK_COLORS.bgPrimary}ee`,
                    backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${FRANK_COLORS.border}`,
                    boxShadow: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
                colorSuccess: {
                    background: `${FRANK_COLORS.success}20`,
                    color: FRANK_COLORS.success,
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: 'xl',
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: FRANK_COLORS.bgSecondary,
                    borderRight: `1px solid ${FRANK_COLORS.border}`,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&:hover': {
                        background: FRANK_COLORS.bgElevated,
                    },
                    '&.Mui-selected': {
                        background: `${FRANK_COLORS.orange}20`,
                        color: FRANK_COLORS.orange,
                        '&:hover': {
                            background: `${FRANK_COLORS.orange}30`,
                        },
                    },
                },
            },
        },
    },
});

// Export default theme for backward compatibility
export const theme = getTheme(true);

