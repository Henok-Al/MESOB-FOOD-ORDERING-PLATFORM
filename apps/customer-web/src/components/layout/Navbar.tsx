import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Box,
    InputBase,
    Paper,
    Menu,
    MenuItem,
    Divider,
    useMediaQuery,
    useTheme,
    Stack,
    Avatar,
    Chip,
    Tooltip,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountCircleIcon,
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
    Language as LanguageIcon,
    Close as CloseIcon,
    Home as HomeIcon,
    Restaurant as RestaurantIcon,
    Receipt as ReceiptIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Login as LoginIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import NotificationButton from '../common/NotificationButton';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const { items: cartItems } = useSelector((state: RootState) => state.cart);
    
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleLogout = () => {
        dispatch(logout());
        handleMenuClose();
        navigate('/login');
    };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/restaurant?search=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
        }
    };
    
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        // TODO: Implement actual theme toggle
    };
    
    const navItems = [
        { text: 'Home', path: '/', icon: <HomeIcon /> },
        { text: 'Restaurants', path: '/', icon: <RestaurantIcon />, scrollTo: 'restaurants' },
        { text: 'Orders', path: '/orders', icon: <ReceiptIcon />, authRequired: true },
        { text: 'Profile', path: '/profile', icon: <PersonIcon />, authRequired: true },
    ];

    const handleNavigation = (path: string, scrollTo?: string) => {
        if (path === '/' && scrollTo) {
            // If we're already on home page, scroll to the section
            if (location.pathname === '/') {
                const element = document.getElementById(scrollTo);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                // Navigate to home page first, then scroll
                navigate(path);
                setTimeout(() => {
                    const element = document.getElementById(scrollTo);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        } else {
            navigate(path);
        }
    };
    
    const drawer = (
        <Box sx={{ width: 300, bgcolor: 'background.default', height: '100%', p: 2 }}>
            <Box sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.7)',
                boxShadow: '0 10px 30px rgba(12,18,32,0.08)',
            }}>
                <Box>
                    <Chip label="Mesob" color="primary" sx={{ fontWeight: 800, letterSpacing: 0.4 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        Premium delivery
                    </Typography>
                </Box>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {navItems.map((item) => (
                    (!item.authRequired || isAuthenticated) && (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => {
                                handleNavigation(item.path, item.scrollTo);
                                handleDrawerToggle();
                            }}
                            selected={location.pathname === item.path}
                        >
                            <ListItemText primary={item.text} />
                        </ListItem>
                    )
                ))}
                {!isAuthenticated && (
                    <>
                        <ListItem button onClick={() => { navigate('/login'); handleDrawerToggle(); }}>
                            <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/register'); handleDrawerToggle(); }}>
                            <ListItemText primary="Register" />
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );
    
    return (
        <>
            <AppBar
                position="fixed"
                color="transparent"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    background: 'linear-gradient(180deg, rgba(255,250,243,0.95), rgba(255,250,243,0.75))',
                    backdropFilter: 'blur(14px)',
                    borderBottom: '1px solid rgba(31,18,12,0.08)',
                }}
            >
                <Toolbar sx={{ minHeight: 78, display: 'flex', gap: 2 }}>
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <Tooltip title="Menu" arrow>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleDrawerToggle}
                                sx={{
                                    mr: 1,
                                    color: 'text.primary',
                                    border: '1px solid rgba(31,18,12,0.12)',
                                    borderRadius: 2,
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    {/* Logo */}
                        <Box
                            onClick={() => navigate('/')}
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                flexGrow: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    background: 'linear-gradient(140deg, #2c1a12, #a96c3f)',
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'white',
                                    fontWeight: 800,
                                    letterSpacing: -0.5,
                                    fontSize: 18,
                                }}
                            >
                                M
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.4, color: 'text.primary' }}>
                                    Mesob
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 0.4 }}>
                                    Elevated delivery
                                </Typography>
                            </Box>
                        </Box>
                    
                    {/* Desktop Navigation */}
                    {!isMobile && (
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 3 }}>
                           {navItems.map((item) => (
                               (!item.authRequired || isAuthenticated) && (
                                   <Button
                                       key={item.text}
                                       color="inherit"
                                       onClick={() => handleNavigation(item.path, item.scrollTo)}
                                       sx={{
                                           fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                                           position: 'relative',
                                           '&::after': {
                                               content: '""',
                                               position: 'absolute',
                                               bottom: -4,
                                               left: 0,
                                               right: 0,
                                               height: 2,
                                               background: location.pathname === item.path
                                                   ? 'text.primary'
                                                   : 'transparent',
                                               borderRadius: 1
                                           },
                                           color: 'text.primary'
                                       }}
                                   >
                                       {item.text}
                                   </Button>
                               )
                           ))}
                       </Box>
                   )}
                    
                    {/* Search Bar */}
                    <Box sx={{ flexGrow: 1, maxWidth: 460, display: { xs: 'none', md: 'block' } }}>
                        <Paper
                            component="form"
                            onSubmit={handleSearch}
                            sx={{
                                p: '5px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255,250,243,0.92)',
                                borderRadius: '16px',
                                border: '1px solid rgba(31,18,12,0.08)',
                                boxShadow: '0 10px 30px rgba(31,18,12,0.08)',
                            }}
                        >
                            <IconButton type="submit" sx={{ p: '10px', color: 'text.primary' }} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1, color: 'text.primary', fontWeight: 600 }}
                                placeholder="Search restaurants..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                inputProps={{ 'aria-label': 'search restaurants' }}
                            />
                        </Paper>
                    </Box>
                    
                    {/* Action Icons */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        {/* Cart Icon */}
                        <IconButton color="inherit" onClick={() => navigate('/checkout')} sx={{ color: 'text.primary' }}>
                            <Badge badgeContent={cartItems.length} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                         
                        {/* Notifications */}
                        <NotificationButton />
                         
                        {/* Theme Toggle */}
                        <IconButton color="inherit" onClick={toggleDarkMode} sx={{ color: 'text.primary' }}>
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                         
                        {/* User Menu */}
                        {isAuthenticated ? (
                            <>
                                <IconButton color="inherit" onClick={handleMenuOpen} sx={{ color: 'text.primary' }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                        {user?.firstName?.[0]}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: { mt: 1.5, minWidth: 200 }
                                    }}
                                >
                                    <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/orders'); handleMenuClose(); }}>
                                        <ReceiptIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        My Orders
                                    </MenuItem>
                                    <MenuItem onClick={() => { navigate('/notifications'); handleMenuClose(); }}>
                                        <NotificationsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        Notifications
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <LogoutIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button
                                    color="inherit"
                                    startIcon={<LoginIcon />}
                                    onClick={() => navigate('/login')}
                                    sx={{ display: { xs: 'none', sm: 'flex' }, color: 'text.primary' }}
                                >
                                    Login
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="inherit"
                                    startIcon={<PersonAddIcon />}
                                    onClick={() => navigate('/register')}
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        borderColor: '#e0e0e0',
                                        ml: 1,
                                        color: 'text.primary',
                                        '&:hover': {
                                            borderColor: 'text.primary'
                                        }
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Stack>
                    
                    {/* Mobile Search Icon */}
                    {isMobile && (
                        <IconButton color="inherit" onClick={() => navigate('/restaurant')} sx={{ ml: 1, color: 'text.primary' }}>
                            <SearchIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>
             
            {/* Mobile Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                {drawer}
            </Drawer>
             
        </>
    );
};

export default Navbar;
