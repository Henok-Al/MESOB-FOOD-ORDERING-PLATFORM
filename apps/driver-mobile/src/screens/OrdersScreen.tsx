import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

interface OrderDto {
  _id: string;
  deliveryAddress: string;
  status: string;
  totalAmount: number;
  tipAmount?: number;
  restaurant: {
    name: string;
    address?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

const statusColors: Record<string, string> = {
  confirmed: '#3b82f6',
  preparing: '#f59e0b',
  ready: '#10b981',
  out_for_delivery: '#8b5cf6',
  delivered: '#22c55e',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toUpperCase();
};

export default function OrdersScreen() {
  const queryClient = useQueryClient();

  const { data: available, isLoading: availableLoading, refetch: refetchAvailable } = useQuery<{
    data: { orders: OrderDto[] };
  }>({
    queryKey: ['driver-available'],
    queryFn: async () => (await api.get('/api/driver/orders/available')).data,
  });

  const { data: active, isLoading: activeLoading, refetch: refetchActive } = useQuery<{
    data: { orders: OrderDto[] };
  }>({
    queryKey: ['driver-active'],
    queryFn: async () => (await api.get('/api/driver/orders/active')).data,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/driver/orders/${id}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-available'] });
      queryClient.invalidateQueries({ queryKey: ['driver-active'] });
      Alert.alert('Success', 'Order accepted!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to accept order');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/driver/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-active'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update status');
    },
  });

  const onRefresh = () => {
    refetchAvailable();
    refetchActive();
  };

  const renderOrder = (order: OrderDto, isActive: boolean) => (
    <View key={order._id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.restaurantName}>{order.restaurant?.name || 'Restaurant'}</Text>
          <Text style={styles.address}>{order.deliveryAddress}</Text>
          {order.restaurant?.address && (
            <Text style={styles.pickupText}>Pickup: {order.restaurant.address}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#6b7280' }]}>
          <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.amount}>ETB {order.totalAmount}</Text>
        {order.tipAmount ? (
          <Text style={styles.tip}>Tip: ETB {order.tipAmount}</Text>
        ) : null}
      </View>

      {order.user && (
        <Text style={styles.customerText}>
          Customer: {order.user.firstName} {order.user.lastName}
          {order.user.phone ? ` · ${order.user.phone}` : ''}
        </Text>
      )}

      <View style={styles.actions}>
        {!isActive ? (
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptMutation.mutate(order._id)}
            disabled={acceptMutation.isPending}
          >
            <Text style={styles.acceptButtonText}>
              {acceptMutation.isPending ? 'Accepting...' : 'Accept Order'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            {order.status !== 'out_for_delivery' && (
              <TouchableOpacity
                style={styles.pickupButton}
                onPress={() => statusMutation.mutate({ id: order._id, status: 'out_for_delivery' })}
                disabled={statusMutation.isPending}
              >
                <Text style={styles.pickupButtonText}>
                  {statusMutation.isPending ? 'Updating...' : 'Picked Up'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deliveredButton}
              onPress={() => statusMutation.mutate({ id: order._id, status: 'delivered' })}
              disabled={statusMutation.isPending}
            >
              <Text style={styles.deliveredButtonText}>
                {statusMutation.isPending ? 'Updating...' : 'Delivered'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const activeOrders = active?.data?.orders || [];
  const availableOrders = available?.data?.orders || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={availableLoading || activeLoading} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Deliveries ({activeOrders.length})</Text>
        {activeOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active deliveries right now.</Text>
          </View>
        ) : (
          activeOrders.map((order) => renderOrder(order, true))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Orders ({availableOrders.length})</Text>
        {availableOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No available orders. Stay online!</Text>
          </View>
        ) : (
          availableOrders.map((order) => renderOrder(order, false))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgPrimary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: FRANK_COLORS.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  orderCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  address: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
    marginTop: 4,
  },
  pickupText: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.orange,
  },
  tip: {
    fontSize: 14,
    color: FRANK_COLORS.success,
    marginLeft: 12,
  },
  customerText: {
    fontSize: 13,
    color: FRANK_COLORS.textSecondary,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: FRANK_COLORS.orange,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  pickupButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  pickupButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  deliveredButton: {
    backgroundColor: FRANK_COLORS.success,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  deliveredButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  emptyText: {
    color: FRANK_COLORS.textMuted,
    fontSize: 14,
  },
});
