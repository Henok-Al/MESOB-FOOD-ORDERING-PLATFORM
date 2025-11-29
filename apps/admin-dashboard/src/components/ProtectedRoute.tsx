import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@food-ordering/constants';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== UserRole.ADMIN) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
