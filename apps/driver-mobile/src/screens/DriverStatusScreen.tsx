import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

interface DriverStats {
  todayOrders: number;
  todayEarnings: number;
  weekOrders: number;
  weekEarnings: number;
  rating: number;
  totalDeliveries: number;
}

export default function DriverStatusScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<DriverStats>({
    todayOrders: 0,
    todayEarnings: 0,
    weekOrders: 0,
    weekEarnings: 0,
    rating: 4.8,
    totalDeliveries: 0,
  });

  // Toggle online status
  const statusMutation = useMutation({
    mutationFn: (available: boolean) =>
      api.patch('/api/driver/availability', { isAvailable: available }),
    onSuccess: (data) => {
      setIsOnline(data.data.driver.isAvailable);
      Alert.alert(
        'Status Updated',
        `You are now ${data.data.driver.isAvailable ? 'online' : 'offline'}`
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update status');
    },
  });

  // Fetch driver stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/driver/stats');
        setStats(response.data.data);
      } catch (error) {
        // Use mock data for demo
        setStats({
          todayOrders: 8,
          todayEarnings: 450,
          weekOrders: 42,
          weekEarnings: 2850,
          rating: 4.9,
          totalDeliveries: 156,
        });
      }
    };
    fetchStats();
  }, []);

  const handleToggleOnline = () => {
    statusMutation.mutate(!isOnline);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status Toggle */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View>
            <Text style={styles.statusLabel}>Your Status</Text>
            <Text style={[styles.statusText, isOnline ? styles.online : styles.offline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: '#767577', true: FRANK_COLORS.orange }}
            thumbColor={isOnline ? '#fff' : '#f4f3f4'}
            disabled={statusMutation.isPending}
          />
        </View>
        <Text style={styles.statusHint}>
          {isOnline
            ? "You're visible to customers and can receive delivery requests"
            : 'Go online to start receiving delivery requests'}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{stats.todayOrders}</Text>
          <Text style={styles.statSubtext}>deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={[styles.statValue, { color: FRANK_COLORS.success }]}>
            ETB {stats.todayEarnings}
          </Text>
          <Text style={styles.statSubtext}>earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>{stats.weekOrders}</Text>
          <Text style={styles.statSubtext}>deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={[styles.statValue, { color: FRANK_COLORS.success }]}>
            ETB {stats.weekEarnings}
          </Text>
          <Text style={styles.statSubtext}>earned</Text>
        </View>
      </View>

      {/* Performance Card */}
      <View style={styles.performanceCard}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.performanceRow}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{stats.rating}</Text>
            <Text style={styles.performanceLabel}>Rating</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{stats.totalDeliveries}</Text>
            <Text style={styles.performanceLabel}>Total Deliveries</Text>
          </View>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <Text style={styles.tipText}>
          • Keep your vehicle clean and in good condition
        </Text>
        <Text style={styles.tipText}>
          • Be friendly and professional with customers
        </Text>
        <Text style={styles.tipText}>
          • Follow GPS directions for fastest delivery
        </Text>
        <Text style={styles.tipText}>
          • Update your status when taking breaks
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgPrimary,
  },
  statusCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  online: {
    color: FRANK_COLORS.success,
  },
  offline: {
    color: FRANK_COLORS.error,
  },
  statusHint: {
    fontSize: 13,
    color: FRANK_COLORS.textMuted,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: '50%',
    padding: 8,
  },
  statCardInner: {
    backgroundColor: FRANK_COLORS.bgCard,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  statLabel: {
    fontSize: 12,
    color: FRANK_COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: FRANK_COLORS.textPrimary,
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
    marginTop: 2,
  },
  performanceCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: FRANK_COLORS.orange,
  },
  performanceLabel: {
    fontSize: 13,
    color: FRANK_COLORS.textMuted,
    marginTop: 4,
  },
  tipsCard: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  tipText: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
