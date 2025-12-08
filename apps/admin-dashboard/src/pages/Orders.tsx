import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Search, Eye, Clock, MapPin, User, DollarSign, Wallet } from 'lucide-react';

interface Order {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    restaurant: {
        _id: string;
        name: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    paymentMethod: 'card' | 'cash';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    deliveryAddress: string;
    createdAt: string;
    statusHistory?: Array<{
        status: string;
        timestamp: string;
        notes?: string;
    }>;
}

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders', statusFilter],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await axios.get(
                `/api/orders?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.data.orders as Order[];
        },
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: async ({ orderId, paymentStatus }: { orderId: string; paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' }) => {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/orders/${orderId}/payment`,
                { paymentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev));
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
            setSelectedOrder(null);
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-blue-100 text-blue-800';
            case 'ready_for_pickup': return 'bg-green-100 text-green-800';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = data?.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-6">Loading orders...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Order Management</h1>
                <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready_for_pickup">Ready</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Restaurant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders?.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {order.user.firstName} {order.user.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500">{order.user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.restaurant.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${order.totalAmount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Card'}
                                    </div>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status.replace(/_/g, ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details - #{selectedOrder?._id.slice(-6).toUpperCase()}</DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            {/* Customer Info */}
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2 flex items-center">
                                    <User className="h-4 w-4 mr-2" />
                                    Customer Information
                                </h3>
                                <p className="text-sm"><strong>Name:</strong> {selectedOrder.user.firstName} {selectedOrder.user.lastName}</p>
                                <p className="text-sm"><strong>Email:</strong> {selectedOrder.user.email}</p>
                                {selectedOrder.user.phone && (
                                    <p className="text-sm"><strong>Phone:</strong> {selectedOrder.user.phone}</p>
                                )}
                            </div>

                            {/* Delivery Address */}
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2 flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Delivery Address
                                </h3>
                                <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                            </div>

                            {/* Order Items */}
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center font-semibold">
                                <span className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Total Amount
                                </span>
                                <span className="text-lg">${selectedOrder.totalAmount.toFixed(2)}</span>
                            </div>

                            {/* Payment Details */}
                            <div className="border-b pb-4">
                                <h3 className="font-semibold mb-2 flex items-center">
                                    <Wallet className="h-4 w-4 mr-2" />
                                    Payment Details
                                </h3>
                                <p className="text-sm capitalize"><strong>Method:</strong> {selectedOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Card'}</p>
                                <p className="text-sm"><strong>Status:</strong> {selectedOrder.paymentStatus.toUpperCase()}</p>
                                {selectedOrder.paymentMethod === 'cash' && selectedOrder.paymentStatus !== 'paid' && (
                                    <button
                                        onClick={() => updatePaymentStatusMutation.mutate({ orderId: selectedOrder._id, paymentStatus: 'paid' })}
                                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                                        disabled={updatePaymentStatusMutation.isPending}
                                    >
                                        {updatePaymentStatusMutation.isPending ? 'Marking…' : 'Mark Cash as Received'}
                                    </button>
                                )}
                            </div>

                            {/* Status Update */}
                            <div>
                                <h3 className="font-semibold mb-2">Update Status</h3>
                                <Select
                                    value={selectedOrder.status}
                                    onValueChange={(status: string) => {
                                        updateStatusMutation.mutate({
                                            orderId: selectedOrder._id,
                                            status,
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="preparing">Preparing</SelectItem>
                                        <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status History */}
                            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Status History
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedOrder.statusHistory.map((history, index) => (
                                            <div key={index} className="text-sm flex justify-between">
                                                <span className="capitalize">{history.status.replace(/_/g, ' ')}</span>
                                                <span className="text-gray-500">
                                                    {new Date(history.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
