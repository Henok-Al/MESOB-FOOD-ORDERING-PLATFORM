import React, { useEffect, useState } from 'react';
import { MoreHorizontal, Loader2, Filter } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { Button } from '../components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface Order {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    items: {
        name: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    status: string;
    createdAt: string;
    deliveryAddress: string;
}

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchOrders = async () => {
        try {
            const restResponse = await api.get('/restaurants');
            const restaurantId = restResponse.data.data.restaurants[0]._id;

            const response = await api.get(`/orders/restaurant/${restaurantId}`);
            setOrders(response.data.data.orders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        initializeSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const initializeSocket = () => {
        const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

        socketInstance.on('connect', async () => {
            console.log('Socket connected');
            // Join restaurant room
            try {
                const restResponse = await api.get('/restaurants');
                const restaurantId = restResponse.data.data.restaurants[0]._id;
                socketInstance.emit('joinRestaurant', restaurantId);
            } catch (error) {
                console.error('Failed to join restaurant room:', error);
            }
        });

        socketInstance.on('orderUpdated', (updatedOrder: Order) => {
            console.log('Order updated:', updatedOrder);
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === updatedOrder._id ? updatedOrder : order
                )
            );
        });

        socketInstance.on('newOrder', (newOrder: Order) => {
            console.log('New order received:', newOrder);
            setOrders((prev) => [newOrder, ...prev]);
        });

        setSocket(socketInstance);
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

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

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter((order) => order.status === filterStatus);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Incoming Orders</h2>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{order.user.firstName} {order.user.lastName}</div>
                                            <div className="text-sm text-muted-foreground">{order.user.phone}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {order.items.map((item, i) => (
                                                    <div key={i}>
                                                        {item.quantity}x {item.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'confirmed')}>
                                                        Confirm
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'preparing')}>
                                                        Preparing
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'ready_for_pickup')}>
                                                        Ready for Pickup
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'out_for_delivery')}>
                                                        Out for Delivery
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order._id, 'delivered')}>
                                                        Delivered
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                        className="text-destructive"
                                                    >
                                                        Cancel
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default OrdersPage;
