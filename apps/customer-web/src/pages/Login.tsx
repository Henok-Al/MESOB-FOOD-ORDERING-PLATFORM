import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Link,
    Alert,
    Grid,
    useTheme,
    useMediaQuery,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import api from '../services/api';
import { RootState } from '../store';

const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { loading, error } = useSelector((state: RootState) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            dispatch(loginStart());
            try {
                const response = await api.post('/auth/login', values);
                dispatch(loginSuccess(response.data.data));
                navigate('/');
            } catch (err: any) {
                dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
            }
        },
    });

    return (
        <Grid container sx={{ height: '100vh' }}>
            {/* Left Side - Image/Branding */}
            {!isMobile && (
                <Grid
                    item
                    md={6}
                    sx={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        position: 'relative',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
                        },
                    }}
                >
                    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', p: 6 }}>
                        <Typography variant="h2" gutterBottom fontWeight="800" sx={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                            Welcome Back!
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: 480, mx: 'auto' }}>
                            Order your favorite meals from the best restaurants.
                        </Typography>
                    </Box>
                </Grid>
            )}

            {/* Right Side - Form */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.default',
                }}
            >
                <Container maxWidth="xs">
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            width: '100%',
                            bgcolor: 'transparent',
                        }}
                    >
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography component="h1" variant="h3" gutterBottom color="primary" fontWeight="700">
                                Mesob
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sign in to continue to your account
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

                        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.8, mb: 3, fontSize: '1.1rem' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Don't have an account?{' '}
                                    <Link
                                        component={RouterLink}
                                        to="/register"
                                        variant="body2"
                                        sx={{ fontWeight: 600, textDecoration: 'none', color: 'primary.main' }}
                                    >
                                        Sign Up
                                    </Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Grid>
        </Grid>
    );
};

export default Login;
