import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'tip' | 'bonus';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

interface WalletBalance {
  available: number;
  pending: number;
  totalEarned: number;
}

export default function DriverWalletScreen() {
  const [wallet, setWallet] = useState<WalletBalance>({
    available: 2450,
    pending: 350,
    totalEarned: 28500,
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'earning',
      amount: 450,
      description: 'Delivery #ORD-1234',
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'tip',
      amount: 100,
      description: 'Tip from delivery #ORD-1234',
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: '3',
      type: 'earning',
      amount: 380,
      description: 'Delivery #ORD-1235',
      date: '2024-01-14',
      status: 'completed',
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: -500,
      description: 'Withdrawal to Bank',
      date: '2024-01-14',
      status: 'pending',
    },
    {
      id: '5',
      type: 'bonus',
      amount: 200,
      description: 'Peak hours bonus',
      date: '2024-01-13',
      status: 'completed',
    },
    {
      id: '6',
      type: 'earning',
      amount: 520,
      description: 'Delivery #ORD-1233',
      date: '2024-01-13',
      status: 'completed',
    },
  ]);

  const withdrawMutation = useMutation({
    mutationFn: (amount: number) =>
      api.post('/api/driver/wallet/withdraw', { amount }),
    onSuccess: () => {
      alert('Withdrawal request submitted');
    },
    onError: () => {
      alert('Failed to process withdrawal');
    },
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return '💰';
      case 'tip':
        return '💵';
      case 'withdrawal':
        return '🏦';
      case 'bonus':
        return '🎁';
      default:
        return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
      case 'tip':
      case 'bonus':
        return FRANK_COLORS.success;
      case 'withdrawal':
        return FRANK_COLORS.error;
      default:
        return FRANK_COLORS.textPrimary;
    }
  };

  const handleWithdraw = () => {
    if (wallet.available > 100) {
      withdrawMutation.mutate(wallet.available);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Text style={styles.transactionIcon}>{getTransactionIcon(item.type)}</Text>
        <View>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
          {item.amount > 0 ? '+' : ''}ETB {Math.abs(item.amount)}
        </Text>
        <Text
          style={[
            styles.transactionStatus,
            { color: item.status === 'completed' ? FRANK_COLORS.success : FRANK_COLORS.orange },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>ETB {wallet.available}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Pending</Text>
            <Text style={styles.balanceItemValue}>ETB {wallet.pending}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Total Earned</Text>
            <Text style={styles.balanceItemValue}>ETB {wallet.totalEarned}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={handleWithdraw}
          disabled={wallet.available <= 100}
        >
          <Text style={styles.withdrawButtonText}>Withdraw All</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today's Earnings</Text>
          <Text style={styles.statValue}>ETB 450</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>ETB 2,850</Text>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Payment Methods */}
      <View style={styles.paymentSection}>
        <Text style={styles.sectionTitle}>Payout Methods</Text>
        <TouchableOpacity style={styles.paymentMethod}>
          <View style={styles.paymentIcon}>
            <Text>🏦</Text>
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Bank Account</Text>
            <Text style={styles.paymentSubtitle}>**** **** **** 1234</Text>
          </View>
          <Text style={styles.paymentCheck}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.paymentMethod, styles.addNewMethod]}>
          <View style={styles.paymentIcon}>
            <Text>+</Text>
          </View>
          <View style={styles.paymentContent}>
            <Text style={styles.paymentTitle}>Add New Method</Text>
          </View>
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
  balanceCard: {
    backgroundColor: FRANK_COLORS.orange,
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginVertical: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  withdrawButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  withdrawButtonText: {
    color: FRANK_COLORS.orange,
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: FRANK_COLORS.textPrimary,
    marginTop: 4,
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FRANK_COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: FRANK_COLORS.textPrimary,
  },
  transactionDate: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionStatus: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  paymentSection: {
    padding: 16,
    paddingTop: 0,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FRANK_COLORS.bgCard,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  addNewMethod: {
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: FRANK_COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentContent: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: FRANK_COLORS.textPrimary,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: FRANK_COLORS.textMuted,
    marginTop: 2,
  },
  paymentCheck: {
    fontSize: 18,
    color: FRANK_COLORS.success,
    fontWeight: '700',
  },
});
