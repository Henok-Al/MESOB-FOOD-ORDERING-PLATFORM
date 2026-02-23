import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { getTheme } from './theme';
import { DarkModeProvider } from './context/DarkModeContext';
import { NotificationProvider } from './context/NotificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantDetails from './pages/RestaurantDetails';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import Notifications from './pages/Notifications';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import RestaurantManagement from './pages/RestaurantManagement';
import OrderManagement from './pages/OrderManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import LoyaltyDashboard from './pages/LoyaltyDashboard';
import WalletDashboard from './components/WalletDashboard';
import Addresses from './pages/Addresses';
import CouponManagement from './pages/CouponManagement';
import NotificationPreferences from './pages/NotificationPreferences';
import Support from './pages/Support';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

const queryClient = new QueryClient();

function AppContent() {
    return (
        <ThemeProvider theme={getTheme(true)}>
            <CssBaseline />
            <BrowserRouter>
                <MainLayout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
                        <Route
                            path="/checkout"
                            element={(
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/orders"
                            element={(
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/orders/:orderId/track"
                            element={(
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/profile"
                            element={(
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/notifications"
                            element={(
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/favorites"
                            element={(
                                <ProtectedRoute>
                                    <Favorites />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/analytics"
                            element={(
                                <ProtectedRoute>
                                    <AnalyticsDashboard />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/dashboard"
                            element={(
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/users"
                            element={(
                                <ProtectedRoute>
                                    <UserManagement />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/restaurants"
                            element={(
                                <ProtectedRoute>
                                    <RestaurantManagement />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/orders"
                            element={(
                                <ProtectedRoute>
                                    <OrderManagement />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/admin/coupons"
                            element={(
                                <ProtectedRoute>
                                    <CouponManagement />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/loyalty"
                            element={(
                                <ProtectedRoute>
                                    <LoyaltyDashboard />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/wallet"
                            element={(
                                <ProtectedRoute>
                                    <WalletDashboard />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/addresses"
                            element={(
                                <ProtectedRoute>
                                    <Addresses />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/notification-preferences"
                            element={(
                                <ProtectedRoute>
                                    <NotificationPreferences />
                                </ProtectedRoute>
                            )}
                        />
                        <Route
                            path="/support"
                            element={(
                                <ProtectedRoute>
                                    <Support />
                                </ProtectedRoute>
                            )}
                        />
                    </Routes>
                </MainLayout>
            </BrowserRouter>
        </ThemeProvider>
    );
}

function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <DarkModeProvider>
                    <NotificationProvider>
                        <AppContent />
                    </NotificationProvider>
                </DarkModeProvider>
            </QueryClientProvider>
        </Provider>
    );
}

export default App;