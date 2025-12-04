import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';
import Orders from './pages/Orders';
import RestaurantMenu from './pages/RestaurantMenu';
import RestaurantMenuPage from './pages/restaurant/Menu';
import RestaurantOrdersPage from './pages/restaurant/Orders';
import RestaurantAnalyticsPage from './pages/restaurant/Analytics';
import Unauthorized from './pages/Unauthorized';
import { UserRole } from '@food-ordering/constants';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              {/* Admin Routes */}
              <Route index element={<Dashboard />} />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="restaurants" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Restaurants />
                </ProtectedRoute>
              } />
              <Route path="restaurants/:id/menu" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <RestaurantMenu />
                </ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <Orders />
                </ProtectedRoute>
              } />

              {/* Restaurant Owner Routes */}
              <Route path="restaurant">
                <Route path="menu" element={
                  <ProtectedRoute allowedRoles={[UserRole.RESTAURANT_OWNER]}>
                    <RestaurantMenuPage />
                  </ProtectedRoute>
                } />
                <Route path="orders" element={
                  <ProtectedRoute allowedRoles={[UserRole.RESTAURANT_OWNER]}>
                    <RestaurantOrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="analytics" element={
                  <ProtectedRoute allowedRoles={[UserRole.RESTAURANT_OWNER]}>
                    <RestaurantAnalyticsPage />
                  </ProtectedRoute>
                } />
              </Route>
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
