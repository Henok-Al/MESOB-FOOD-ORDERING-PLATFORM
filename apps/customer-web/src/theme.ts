import { createTheme } from '@mui/material/styles';

// Warm, café-inspired palette inspired by Coffeemania
const palette = {
    primary: '#2c1a12', // espresso
    secondary: '#d59f65', // caramel
    ink: '#1f120c',
    surface: '#f6f0e7', // latte foam
    card: '#fffaf3',
    success: '#3ba17c',
    warning: '#e48a3c',
    error: '#d14545',
};

export const getTheme = (darkMode: boolean = false) => createTheme({
    palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
            main: palette.primary,
            dark: '#0b5f5a',
            light: '#8bd8d3',
            contrastText: '#ffffff',
        },
        secondary: {
            main: palette.secondary,
            contrastText: '#0b132b',
        },
        success: { main: palette.success },
        warning: { main: palette.warning },
        error: { main: palette.error },
        background: {
            default: darkMode ? '#0b1021' : palette.surface,
            paper: darkMode ? '#0f172a' : palette.card,
        },
        text: {
            primary: darkMode ? '#f1f5f9' : palette.ink,
            secondary: darkMode ? '#cbd5e1' : '#475569',
            disabled: darkMode ? '#64748b' : '#94a3b8',
        },
        divider: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(12,18,32,0.12)',
    },
    typography: {
        fontFamily: '"Sora", "Inter", "Helvetica Neue", Arial, sans-serif',
        h1: { fontFamily: '"Playfair Display", "Sora", serif', fontWeight: 800, letterSpacing: '-0.04em', fontSize: '3.4rem', lineHeight: 1.05 },
        h2: { fontFamily: '"Playfair Display", "Sora", serif', fontWeight: 750, letterSpacing: '-0.03em', fontSize: '2.6rem', lineHeight: 1.15 },
        h3: { fontFamily: '"Playfair Display", "Sora", serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '2.1rem', lineHeight: 1.2 },
        h4: { fontWeight: 700, fontSize: '1.6rem', lineHeight: 1.3 },
        h5: { fontWeight: 650, fontSize: '1.35rem', lineHeight: 1.35 },
        h6: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4, letterSpacing: '0.01em' },
        body1: { fontWeight: 400, fontSize: '1rem', lineHeight: 1.72 },
        body2: { fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.55 },
        button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.03em' },
        overline: { letterSpacing: '0.26em', fontWeight: 700 },
    },
    shape: { borderRadius: 14 },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Sora:wght@400;500;600;700&display=swap');
                body {
                    background: radial-gradient(circle at 10% 10%, rgba(217,159,101,0.12), transparent 26%),
                                radial-gradient(circle at 80% 5%, rgba(44,26,18,0.08), transparent 28%),
                                radial-gradient(circle at 60% 70%, rgba(44,26,18,0.05), transparent 35%),
                                ${palette.surface};
                    color: ${palette.ink};
                }
                ::selection {
                    background: ${palette.primary};
                    color: #fff;
                }
                * {
                    scrollbar-width: thin;
                    scrollbar-color: ${palette.primary} transparent;
                }
                *::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                *::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, ${palette.primary}, ${palette.secondary});
                    border-radius: 999px;
                }
            `,
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '11px 20px',
                    boxShadow: '0 10px 30px rgba(44,26,18,0.14)',
                    transition: 'all 0.18s ease',
                    '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 32px rgba(44,26,18,0.2)' },
                },
                containedPrimary: {
                    background: 'linear-gradient(120deg, #2c1a12, #a96c3f)',
                },
                containedSecondary: {
                    background: '#fff',
                    color: palette.ink,
                    border: '1px solid rgba(12,18,32,0.08)',
                    boxShadow: '0 10px 30px rgba(12,18,32,0.08)',
                    '&:hover': { background: '#fdfaf4' },
                },
                outlined: {
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: 'rgba(12,18,32,0.12)',
                    '&:hover': { borderColor: palette.primary, background: 'rgba(15,118,110,0.06)' },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(12,18,32,0.06)',
                    boxShadow: '0 12px 40px rgba(12,18,32,0.06)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 18,
                    border: '1px solid rgba(31,18,12,0.08)',
                    boxShadow: '0 16px 45px rgba(31,18,12,0.08)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 24px 60px rgba(31,18,12,0.16)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff',
                        border: '1px solid rgba(12,18,32,0.08)',
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'rgba(12,18,32,0.15)' },
                        '&.Mui-focused fieldset': { borderColor: palette.primary, borderWidth: 1.5 },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(14px)',
                    borderBottom: '1px solid rgba(12,18,32,0.06)',
                    boxShadow: '0 12px 40px rgba(12,18,32,0.06)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 600,
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: 'xl',
            },
        },
    },
});

// Export default theme for backward compatibility
export const theme = getTheme(false);
