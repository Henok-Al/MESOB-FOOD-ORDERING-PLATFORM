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
    Avatar
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
        { text: 'Restaurants', path: '/', icon: <RestaurantIcon /> },
        { text: 'Orders', path: '/orders', icon: <ReceiptIcon />, authRequired: true },
        { text: 'Profile', path: '/profile', icon: <PersonIcon />, authRequired: true },
    ];
    
    const drawer = (
        <Box sx={{ width: 280, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    Mesob
                </Typography>
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
                                navigate(item.path);
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
                sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar sx={{ minHeight: 64 }}>
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    
                    {/* Logo */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 800,
                            letterSpacing: -0.5,
                            cursor: 'pointer',
                            display: { xs: 'none', sm: 'block' }
                        }}
                        onClick={() => navigate('/')}
                    >
                        Mesob
                    </Typography>
                    
                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 3 }}>
                            {navItems.map((item) => (
                                (!item.authRequired || isAuthenticated) && (
                                    <Button
                                        key={item.text}
                                        color="inherit"
                                        onClick={() => navigate(item.path)}
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
                                                    ? 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)' 
                                                    : 'transparent',
                                                borderRadius: 1
                                            }
                                        }}
                                    >
                                        {item.text}
                                    </Button>
                                )
                            ))}
                        </Box>
                    )}
                    
                    {/* Search Bar */}
                    <Box sx={{ flexGrow: 1, maxWidth: 400, display: { xs: 'none', md: 'block' } }}>
                        <Paper
                            component="form"
                            onSubmit={handleSearch}
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: 2,
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}
                        >
                            <IconButton type="submit" sx={{ p: '10px', color: 'white' }} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                            <InputBase
                                sx={{ ml: 1, flex: 1, color: 'white' }}
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
                        <IconButton color="inherit" onClick={() => navigate('/checkout')}>
                            <Badge badgeContent={cartItems.length} color="error">
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                        
                        {/* Notifications */}
                        <NotificationButton />
                        
                        {/* Theme Toggle */}
                        <IconButton color="inherit" onClick={toggleDarkMode}>
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                        
                        {/* User Menu */}
                        {isAuthenticated ? (
                            <>
                                <IconButton color="inherit" onClick={handleMenuOpen}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
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
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
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
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        ml: 1
                                    }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Stack>
                    
                    {/* Mobile Search Icon */}
                    {isMobile && (
                        <IconButton color="inherit" onClick={() => navigate('/restaurant')} sx={{ ml: 1 }}>
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