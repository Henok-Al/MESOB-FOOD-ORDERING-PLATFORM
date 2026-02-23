import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryFee: number;
  tip: number;
  status: string;
  estimatedTime: string;
  specialInstructions?: string;
}

interface Props {
  route?: {
    params: {
      orderId: string;
    };
  };
  navigation?: any;
}

export default function OrderDetailsScreen({ route }: Props) {
  const orderId = route?.params?.orderId || 'ORD-12345';
  
  const [order] = useState<OrderDetails>({
    orderId: orderId,
    customerName: 'John Doe',
    customerPhone: '+251912345678',
    restaurantName: 'Habesha Restaurant',
    restaurantAddress: 'Bole Road, Addis Ababa',
    restaurantPhone: '+251911234567',
    deliveryAddress: 'Lebanon Street, Addis Ababa',
    items: [
      { name: 'Kitfo', quantity: 2, price: 350 },
      { name: 'Injera with Shiro', quantity: 1, price: 150 },
      { name: 'Local Beer (Tej)', quantity: 2, price: 100 },
    ],
    totalAmount: 600,
    deliveryFee: 50,
    tip: 100,
    status: 'pending',
    estimatedTime: '25 mins',
    specialInstructions: 'Please knock on the door, ground floor apartment',
  });

  const callCustomer = () => {
    Linking.openURL(`tel:${order.customerPhone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const callRestaurant = () => {
    Linking.openURL(`tel:${order.restaurantPhone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`).catch(() => {
      Alert.alert('Error', 'Unable to open maps');
    });
  };

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      api.patch(`/api/driver/orders/${orderId}/status`, { status: newStatus }),
    onSuccess: () => {
      Alert.alert('Success', 'Order status updated');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update status');
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.header}>
        <View style={styles.orderIdRow}>
          <Text style={styles.orderId}>{order.orderId}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.estimatedTime}>Estimated: {order.estimatedTime}</Text>
      </View>

      {/* Customer Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{order.customerName}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
            <Text style={styles.callButtonText}>📞 Call</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addressRow}
          onPress={() => openMaps(order.deliveryAddress)}
        >
          <View style={styles.infoIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
          </View>
          <Text style={styles.navigateText}>Navigate →</Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restaurant</Text>
        <Text style={styles.restaurantName}>{order.restaurantName}</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Text style={styles.iconText}>🏪</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{order.restaurantAddress}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => openMaps(order.restaurantAddress)}
          >
            <Text style={styles.callButtonText}>🗺️ Map</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.callRestaurantButton} onPress={callRestaurant}>
          <Text style={styles.callRestaurantText}>📞 Call Restaurant</Text>
        </TouchableOpacity>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>ETB {item.price * item.quantity}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>ETB {order.totalAmount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>ETB {order.deliveryFee}</Text>
        </View>
        {order.tip > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip</Text>
            <Text style={[styles.summaryValue, { color: FRANK_COLORS.success }]}>
              +ETB {order.tip}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalValue}>
            ETB {order.totalAmount + order.deliveryFee + order.tip}
          </Text>
        </View>
      </View>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Special Instructions</Text>
          <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => updateStatusMutation.mutate('accepted')}
        >
          <Text style={styles.primaryButtonText}>Accept Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('Decline', 'Are you sure you want to decline this order?')}
        >
          <Text style={styles.secondaryButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgPrimary,
  },
  header: {
    backgroundColor: FRANK_COLORS.bgCard,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  statusBadge: {
    backgroundColor: FRANK_COLORS.orange,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  estimatedTime: {
    fontSize: 14,
    color: FRANK_COLORS.textMuted,
    marginTop: 8,
  },
  card: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FRANK_COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: FRANK_COLORS.textPrimary,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: FRANK_COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
    marginTop: 8,
  },
  navigateText: {
    color: FRANK_COLORS.orange,
    fontWeight: '600',
    fontSize: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
    marginBottom: 12,
  },
  callRestaurantButton: {
    backgroundColor: FRANK_COLORS.bgPrimary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  callRestaurantText: {
    color: FRANK_COLORS.textPrimary,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '700',
    color: FRANK_COLORS.orange,
    marginRight: 8,
    width: 24,
  },
  itemName: {
    fontSize: 14,
    color: FRANK_COLORS.textPrimary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: FRANK_COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: FRANK_COLORS.border,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: FRANK_COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    color: FRANK_COLORS.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: FRANK_COLORS.success,
  },
  instructionsText: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: FRANK_COLORS.success,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderWidth: 1,
    borderColor: FRANK_COLORS.error,
  },
  secondaryButtonText: {
    color: FRANK_COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
