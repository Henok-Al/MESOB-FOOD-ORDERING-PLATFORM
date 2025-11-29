import React from 'react';
import { Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

interface OrderItem {
    product: {
        name: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    items: OrderItem[];
    totalAmount: number;
    status: string;
    deliveryAddress: string;
    paymentMethod: string;
    createdAt: string;
}

interface OrderCardProps {
    order: Order;
    onStatusChange: (orderId: string, newStatus: string) => void;
    updating?: boolean;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange, updating }) => {
    const formatTime = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">Order #{order._id.slice(-6)}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <User className="h-4 w-4" />
                            <span>{order.user.firstName} {order.user.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(order.createdAt)}</span>
                        </div>
                    </div>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {/* Order Items */}
                <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span>
                                {item.quantity}x {item.product.name}
                            </span>
                            <span className="font-medium">${item.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                </div>

                {/* Delivery Address */}
                <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Delivery Address</p>
                    <p className="text-sm">{order.deliveryAddress}</p>
                </div>

                {/* Status Update */}
                <div className="mt-4 pt-4 border-t">
                    <label className="text-sm font-medium mb-2 block">Update Status</label>
                    <Select
                        value={order.status}
                        onValueChange={(value) => onStatusChange(order._id, value)}
                        disabled={updating}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};
