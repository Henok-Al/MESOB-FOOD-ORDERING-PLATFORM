import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FRANK_COLORS } from '../theme';

interface LoyaltyData {
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsToNextTier: number;
  nextTier: string | null;
  recentTransactions: Array<{
    type: 'earned' | 'redeemed' | 'bonus' | 'expired';
    points: number;
    description: string;
    createdAt: string;
  }>;
}

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const TIER_BENEFITS: Record<string, string[]> = {
  bronze: [
    'Earn 1 point per $1 spent',
    'Access to member-only promotions',
    'Birthday reward',
  ],
  silver: [
    'Earn 1.1 points per $1 spent (10% bonus)',
    'Free delivery on orders over $25',
    'Priority customer support',
  ],
  gold: [
    'Earn 1.25 points per $1 spent (25% bonus)',
    'Free delivery on all orders',
    'Exclusive restaurant access',
    'Double points on weekends',
  ],
  platinum: [
    'Earn 1.5 points per $1 spent (50% bonus)',
    'Free delivery + no service fees',
    'Dedicated support line',
    'Triple points on weekends',
    'Surprise rewards',
  ],
};

export default function LoyaltyScreen() {
  const [loyalty, setLoyalty] = React.useState<LoyaltyData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { token } = useAuth();

  React.useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get('/loyalty');
      setLoyalty(response.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const getTierProgress = () => {
    if (!loyalty || !loyalty.nextTier) return 100;
    const thresholds: Record<string, number> = {
      bronze: 0,
      silver: 500,
      gold: 1500,
      platinum: 5000,
    };
    const current = thresholds[loyalty.tier];
    const next = thresholds[loyalty.nextTier] || 5000;
    const progress = ((loyalty.lifetimePoints - current) / (next - current)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const handleRedeemPoints = () => {
    if (!loyalty || loyalty.points < 100) {
      Alert.alert('Insufficient Points', 'You need at least 100 points to redeem ($1 value)');
      return;
    }
    Alert.alert(
      'Redeem Points',
      `You have ${loyalty.points} points worth $${(loyalty.points / 100).toFixed(2)}.\n\nPoints can be automatically applied to your next order.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => Alert.alert('Success', 'Points will be applied to your next order!') },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={FRANK_COLORS.orange} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Tier Card */}
      <View
        style={[
          styles.tierCard,
          { backgroundColor: TIER_COLORS[loyalty?.tier || 'bronze'] },
        ]}
      >
        <View style={styles.tierHeader}>
          <Ionicons name="trophy" size={48} color="#fff" />
          <View style={styles.tierInfo}>
            <Text style={styles.tierTitle}>
              {loyalty?.tier.charAt(0).toUpperCase()}
              {loyalty?.tier.slice(1)} Tier
            </Text>
            <Text style={styles.pointsText}>
              {loyalty?.points.toLocaleString()} Points Available
            </Text>
          </View>
        </View>

        {loyalty?.nextTier && (
          <>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${getTierProgress()}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {loyalty.pointsToNextTier?.toLocaleString()} points to {loyalty.nextTier}
            </Text>
          </>
        )}
      </View>

      {/* Points Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Points Summary</Text>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{loyalty?.points.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Available Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{loyalty?.lifetimePoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Lifetime Points</Text>
          </View>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Points Value:</Text>
          <Text style={styles.valueAmount}>
            ${((loyalty?.points || 0) / 100).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Redeem Button */}
      <TouchableOpacity style={styles.redeemButton} onPress={handleRedeemPoints}>
        <Text style={styles.redeemButtonText}>Redeem Points</Text>
        <Ionicons name="gift" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Tier Benefits */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {loyalty?.tier.charAt(0).toUpperCase()}
          {loyalty?.tier.slice(1)} Benefits
        </Text>
        {TIER_BENEFITS[loyalty?.tier || 'bronze'].map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={16} color={FRANK_COLORS.orange} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Recent Activity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {loyalty?.recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>No activity yet</Text>
        ) : (
          loyalty?.recentTransactions.map((transaction: any, index: number) => (
            <View key={index} style={styles.transactionRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.pointsBadge,
                  {
                    backgroundColor:
                      transaction.type === 'redeemed'
                        ? '#ef4444'
                        : transaction.type === 'bonus'
                        ? '#22c55e'
                        : FRANK_COLORS.orange,
                  },
                ]}
              >
                <Text style={styles.pointsBadgeText}>
                  {transaction.type === 'redeemed' ? '-' : '+'}
                  {transaction.points}
                </Text>
              </View>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierInfo: {
    marginLeft: 12,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 8,
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: FRANK_COLORS.orange,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
  },
  valueLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  redeemButton: {
    backgroundColor: FRANK_COLORS.orange,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  redeemButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    color: '#e5e7eb',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  pointsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});
