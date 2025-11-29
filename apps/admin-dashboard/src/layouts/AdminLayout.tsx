import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Store, ShoppingBag, LogOut, Menu } from 'lucide-react';
import clsx from 'clsx';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Restaurants', href: '/restaurants', icon: Store },
        { name: 'Orders', href: '/orders', icon: ShoppingBag },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col bg-gray-900 text-white">
                <div className="flex items-center justify-center h-16 bg-gray-800">
                    <span className="text-xl font-bold">MESOB Admin</span>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300',
                                            'mr-3 flex-shrink-0 h-6 w-6'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex bg-gray-800 p-4">
                    <div className="flex items-center w-full">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-medium text-gray-300 hover:text-white flex items-center mt-1"
                            >
                                <LogOut className="h-3 w-3 mr-1" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm md:hidden">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h1 className="text-lg font-bold text-gray-900">MESOB Admin</h1>
                        <button className="text-gray-500 hover:text-gray-700">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
