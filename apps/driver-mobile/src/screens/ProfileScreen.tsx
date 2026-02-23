import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { FRANK_COLORS } from '../theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const availabilityMutation = useMutation({
    mutationFn: (available: boolean) =>
      api.patch('/api/driver/availability', { isAvailable: available }),
    onSuccess: () => {
      Alert.alert('Success', `You are now ${isAvailable ? 'online' : 'offline'}`);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update availability');
      setIsAvailable(!isAvailable);
    },
  });

  const handleToggleAvailability = (value: boolean) => {
    setIsAvailable(value);
    availabilityMutation.mutate(value);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await logout();
            queryClient.clear();
            setLoading(false);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.role}>Driver</Text>
      </View>

      {/* Availability Toggle */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>Online Status</Text>
            <Text style={styles.cardSubtitle}>
              {isAvailable ? 'You are receiving orders' : 'You are offline'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: '#e5e7eb', true: '#f97316' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{user?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Driver ID</Text>
          <Text style={styles.infoValue}>#{user?._id?.slice(-6)}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#dc2626" />
        ) : (
          <Text style={styles.logoutText}>Logout</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.version}>Driver App v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FRANK_COLORS.bgPrimary,
  },
  header: {
    backgroundColor: FRANK_COLORS.bgSecondary,
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FRANK_COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  role: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: FRANK_COLORS.bgCard,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FRANK_COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: FRANK_COLORS.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: FRANK_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: FRANK_COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: FRANK_COLORS.textPrimary,
  },
  logoutButton: {
    backgroundColor: `${FRANK_COLORS.error}20`,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${FRANK_COLORS.error}40`,
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    color: FRANK_COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: FRANK_COLORS.textMuted,
    fontSize: 12,
    marginBottom: 24,
  },
});
