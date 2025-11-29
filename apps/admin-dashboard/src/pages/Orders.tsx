import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Order } from '@food-ordering/types';
import { OrderStatus } from '@food-ordering/constants';
import { Search, Clock, MapPin } from 'lucide-react';
import { formatCurrency, formatDate } from '@food-ordering/utils';
import clsx from 'clsx';

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Note: In a real app, we'd have an endpoint to get ALL orders for admin.
    // Reusing 'myorders' or 'restaurant orders' isn't quite right.
    // Assuming we update backend to allow admins to fetch all orders or use a specific endpoint.
    // For now, let's assume /api/orders returns all orders for admin (we might need to update controller).
    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await axios.get('/api/orders/admin/all');
            return response.data.data.orders as Order[];
        },
    });

    if (isLoading) return <div className="p-6">Loading orders...</div>;
    if (error) return <div className="p-6 text-red-600">Error loading orders</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {orders?.map((order) => (
                        <li key={order._id || order.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                        Order #{order._id?.slice(-6) || 'N/A'}
                                    </p>
                                    <p className="flex items-center text-sm text-gray-500 mt-1">
                                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={clsx(
                                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                        order.status === OrderStatus.DELIVERED ? "bg-green-100 text-green-800" :
                                            order.status === OrderStatus.CANCELLED ? "bg-red-100 text-red-800" :
                                                "bg-yellow-100 text-yellow-800"
                                    )}>
                                        {order.status}
                                    </span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {formatCurrency(order.totalAmount)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                        {order.deliveryAddress}
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Orders;
