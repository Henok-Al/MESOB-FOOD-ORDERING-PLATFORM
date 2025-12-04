import { useEffect, useState } from 'react';
import { Users, Store, ShoppingBag, DollarSign } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePermission } from '../hooks/usePermission';

interface DashboardData {
    overview: {
        totalUsers?: number;
        totalRestaurants?: number;
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        restaurantName?: string;
    };
    ordersByStatus: Array<{ _id: string; count: number }>;
    dailyRevenue: Array<{ _id: string; revenue: number; orders: number }>;
    topRestaurants?: Array<{ name: string; revenue: number; orders: number }>;
    popularItems?: Array<{ _id: string; totalOrdered: number; revenue: number }>;
}

const Dashboard = () => {
    const { user } = useAuth();
    const { isAdmin } = usePermission();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const endpoint = isAdmin
                ? `/api/analytics/admin/dashboard?${params}`
                : `/api/analytics/restaurant/dashboard?${params}`;

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading dashboard...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Failed to load dashboard data</div>
            </div>
        );
    }

    const stats = isAdmin ? [
        {
            name: 'Total Users',
            value: data.overview.totalUsers?.toLocaleString() || '0',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            name: 'Total Restaurants',
            value: data.overview.totalRestaurants?.toLocaleString() || '0',
            icon: Store,
            color: 'bg-green-500'
        },
        {
            name: 'Total Orders',
            value: data.overview.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            color: 'bg-purple-500'
        },
        {
            name: 'Total Revenue',
            value: `$${data.overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'bg-yellow-500'
        },
    ] : [
        {
            name: 'Total Orders',
            value: data.overview.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            color: 'bg-purple-500'
        },
        {
            name: 'Total Revenue',
            value: `$${data.overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'bg-yellow-500'
        },
    ];

    const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    const orderStatusData = data.ordersByStatus.map(item => ({
        name: item._id.replace(/_/g, ' ').toUpperCase(),
        value: item.count
    }));

    const revenueChartData = data.dailyRevenue.map(item => ({
        date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.revenue,
        orders: item.orders
    }));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isAdmin ? 'Dashboard Overview' : `${data.overview.restaurantName || 'Restaurant'} Dashboard`}
                    </h1>
                    {!isAdmin && data.overview.restaurantName && (
                        <p className="text-sm text-gray-500 mt-1">Restaurant Owner View</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                        onClick={() => setDateRange({ startDate: '', endDate: '' })}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-md p-3 ${item.color}`}>
                                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {item.name}
                                            </dt>
                                            <dd className="text-2xl font-semibold text-gray-900">
                                                {item.value}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Average Order Value */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Average Order Value</h3>
                <p className="text-3xl font-bold text-green-600">
                    ${data.overview.averageOrderValue.toFixed(2)}
                </p>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Trend */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders by Status */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {orderStatusData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Restaurants - Admin Only */}
            {isAdmin && data.topRestaurants && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Restaurants by Revenue</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.topRestaurants}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                            <Bar dataKey="orders" fill="#10B981" name="Orders" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
