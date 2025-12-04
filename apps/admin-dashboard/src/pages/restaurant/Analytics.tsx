import { useEffect, useState } from 'react';
import { TrendingUp, Star, ShoppingBag, DollarSign } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface AnalyticsData {
    overview: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    };
    ordersByStatus: Array<{ _id: string; count: number }>;
    popularItems: Array<{ _id: string; totalOrdered: number; revenue: number }>;
    ratings: {
        averageRating: number;
        averageFoodRating: number;
        averageServiceRating: number;
        averageDeliveryRating: number;
        totalReviews: number;
    };
    dailyOrders: Array<{ _id: string; orders: number; revenue: number }>;
}

const Analytics = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchRestaurantId();
    }, []);

    useEffect(() => {
        if (restaurantId) {
            fetchAnalytics();
        }
    }, [restaurantId, dateRange]);

    const fetchRestaurantId = async () => {
        try {
            const response = await api.get('/restaurants/me');
            const id = response.data.data.restaurant?._id;
            if (id) setRestaurantId(id);
        } catch (error) {
            console.error('Failed to fetch restaurant:', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await api.get(
                `/analytics/restaurant/${restaurantId}?${params}`
            );
            setData(response.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading analytics...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Failed to load analytics data</div>
            </div>
        );
    }

    const stats = [
        {
            name: 'Total Orders',
            value: data.overview.totalOrders.toLocaleString(),
            icon: ShoppingBag,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            name: 'Total Revenue',
            value: `$${data.overview.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            name: 'Avg Order Value',
            value: `$${data.overview.averageOrderValue.toFixed(2)}`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        },
        {
            name: 'Average Rating',
            value: data.ratings.averageRating.toFixed(1),
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100'
        },
    ];

    const dailyChartData = data.dailyOrders.map(item => ({
        date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: item.orders,
        revenue: item.revenue
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card key={item.name}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{item.name}</p>
                                        <p className="text-2xl font-bold mt-2">{item.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${item.bgColor}`}>
                                        <Icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Ratings Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Ratings ({data.ratings.totalReviews} reviews)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Food Quality</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {data.ratings.averageFoodRating.toFixed(1)} ⭐
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Service</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {data.ratings.averageServiceRating.toFixed(1)} ⭐
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Delivery</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {data.ratings.averageDeliveryRating.toFixed(1)} ⭐
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600">Overall</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {data.ratings.averageRating.toFixed(1)} ⭐
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Orders & Revenue Trend (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.6}
                                    name="Orders"
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.6}
                                    name="Revenue ($)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Popular Items */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Popular Menu Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.popularItems.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalOrdered" fill="#8B5CF6" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Orders by Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {data.ordersByStatus.map((status) => (
                            <div key={status._id} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 capitalize">
                                    {status._id.replace(/_/g, ' ')}
                                </p>
                                <p className="text-2xl font-bold mt-2">{status.count}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Analytics;
