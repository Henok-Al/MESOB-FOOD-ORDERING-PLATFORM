import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

interface OrderSummary {
  _id: string;
  totalAmount: number;
  tipAmount?: number;
  createdAt: string;
}

interface EarningsData {
  totalTips: number;
  deliveries: number;
  recent: OrderSummary[];
}

export default function EarningsScreen() {
  const { data, isLoading, refetch } = useQuery<EarningsData>({
    queryKey: ['driver-earnings'],
    queryFn: async () => (await api.get('/api/driver/earnings')).data.data,
  });

  const recent = data?.recent || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Tips</Text>
          <Text style={styles.summaryAmount}>ETB {data?.totalTips ?? 0}</Text>
          <Text style={styles.summarySubtext}>{data?.deliveries ?? 0} deliveries</Text>
        </View>
      </View>

      {/* Recent Deliveries */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Deliveries</Text>
        {recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No deliveries yet.</Text>
          </View>
        ) : (
          recent.map((order) => (
            <View key={order._id} style={styles.orderRow}>
              <View>
                <Text style={styles.orderId}>#{order._id.slice(-6)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.orderBadge}>
                <Text style={styles.badgeText}>Delivered</Text>
              </View>
              <Text style={styles.tipText}>ETB {order.tipAmount || 0}</Text>
            </View>
          ))
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
  summaryContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: FRANK_COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: FRANK_COLORS.orange,
    marginTop: 8,
  },
  summarySubtext: {
    fontSize: 14,
    color: FRANK_COLORS.textMuted,
    marginTop: 4,
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
  orderRow: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
    marginTop: 2,
  },
  orderBadge: {
    backgroundColor: `${FRANK_COLORS.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: FRANK_COLORS.success,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tipText: {
    fontSize: 14,
    fontWeight: '700',
    color: FRANK_COLORS.success,
  },
});
