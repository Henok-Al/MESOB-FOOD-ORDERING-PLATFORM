import React from 'react';
import {
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingBag,
    LogOut,
    Menu as MenuIcon,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { type RootState } from '../store';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/' },
        { text: 'Menu Management', icon: <UtensilsCrossed className="w-5 h-5" />, path: '/menu' },
        { text: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, path: '/orders' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold text-primary">Mesob Partner</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Button
                            key={item.text}
                            variant={location.pathname === item.path ? 'default' : 'ghost'}
                            className={`w-full justify-start ${location.pathname === item.path ? '' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon}
                            <span className="ml-3">{item.text}</span>
                        </Button>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 md:pl-64 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center px-4 md:hidden justify-between sticky top-0 z-40">
                    <h1 className="text-lg font-bold text-primary">Mesob Partner</h1>
                    <Button variant="ghost" size="icon">
                        <MenuIcon className="w-6 h-6" />
                    </Button>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
