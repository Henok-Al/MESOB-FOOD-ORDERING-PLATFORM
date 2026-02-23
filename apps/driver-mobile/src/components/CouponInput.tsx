import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { FRANK_COLORS } from '../theme';

interface CouponInputProps {
  orderAmount: number;
  restaurantId: string;
  onCouponApplied: (discount: number, code: string) => void;
  appliedCoupon?: { code: string; discount: number } | null;
}

export default function CouponInput({
  orderAmount,
  restaurantId,
  onCouponApplied,
  appliedCoupon,
}: CouponInputProps) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const validateCoupon = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderAmount,
        restaurantId,
      });

      const { discount, code: validatedCode } = response.data.data.coupon;
      Alert.alert('Success', `Coupon applied! You saved $${discount.toFixed(2)}`);
      onCouponApplied(discount, validatedCode);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <View style={styles.appliedContainer}>
        <View style={styles.appliedContent}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          <View style={styles.appliedText}>
            <Text style={styles.appliedTitle}>Coupon Applied: {appliedCoupon.code}</Text>
            <Text style={styles.appliedDiscount}>
              You saved ${appliedCoupon.discount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="ticket" size={20} color={FRANK_COLORS.orange} />
        <Text style={styles.title}>Apply Coupon</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter coupon code"
          placeholderTextColor="#9ca3af"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={[styles.applyButton, loading && styles.applyButtonDisabled]}
          onPress={validateCoupon}
          disabled={loading || !code.trim()}
        >
          <Text style={styles.applyButtonText}>
            {loading ? 'Checking...' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgSecondary,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  applyButton: {
    backgroundColor: FRANK_COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  appliedContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  appliedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appliedText: {
    flex: 1,
  },
  appliedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  appliedDiscount: {
    fontSize: 14,
    color: '#22c55e',
  },
});
