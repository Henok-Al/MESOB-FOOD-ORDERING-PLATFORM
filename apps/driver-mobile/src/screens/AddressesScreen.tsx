import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FRANK_COLORS } from '../theme';

interface Address {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);

  const [formData, setFormData] = React.useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
    deliveryInstructions: '',
    contactName: '',
    contactPhone: '',
  });

  React.useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      setAddresses(response.data.data.addresses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingAddress) {
        await api.patch(`/addresses/${editingAddress._id}`, formData);
      } else {
        await api.post('/addresses', formData);
      }
      fetchAddresses();
      setModalVisible(false);
      setEditingAddress(null);
      resetForm();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/addresses/${id}`);
              fetchAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}/set-default`);
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
      deliveryInstructions: address.deliveryInstructions || '',
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
    });
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingAddress(null);
    resetForm();
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isDefault: false,
      deliveryInstructions: '',
      contactName: '',
      contactPhone: '',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={FRANK_COLORS.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={FRANK_COLORS.border} />
            <Text style={styles.emptyText}>No saved addresses yet</Text>
            <Text style={styles.emptySubtext}>Add your first address!</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="location"
                    size={24}
                    color={address.isDefault ? FRANK_COLORS.orange : '#9ca3af'}
                  />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressName}>
                    {address.name}
                    {address.isDefault && (
                      <Text style={styles.defaultBadge}> (Default)</Text>
                    )}
                  </Text>
                  <Text style={styles.addressText}>{address.street}</Text>
                  <Text style={styles.addressText}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>
                  {address.deliveryInstructions && (
                    <Text style={styles.instructions}>
                      {address.deliveryInstructions}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.cardActions}>
                {!address.isDefault && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(address._id)}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(address)}
                >
                  <Ionicons name="create-outline" size={18} color={FRANK_COLORS.orange} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(address._id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.input}
                placeholder="Address Name (e.g., Home, Work)"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Street Address"
                placeholderTextColor="#9ca3af"
                value={formData.street}
                onChangeText={(text) => setFormData({ ...formData, street: text })}
              />
              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  placeholderTextColor="#9ca3af"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="State"
                  placeholderTextColor="#9ca3af"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="ZIP Code"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={formData.zipCode}
                onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Name"
                placeholderTextColor="#9ca3af"
                value={formData.contactName}
                onChangeText={(text) => setFormData({ ...formData, contactName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Phone"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={formData.contactPhone}
                onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Delivery Instructions (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                value={formData.deliveryInstructions}
                onChangeText={(text) =>
                  setFormData({ ...formData, deliveryInstructions: text })
                }
              />

              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Set as default address</Text>
                <Switch
                  value={formData.isDefault}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isDefault: value })
                  }
                  trackColor={{ false: '#3f3f46', true: FRANK_COLORS.orange }}
                  thumbColor="#fff"
                />
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: FRANK_COLORS.orange,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  card: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  defaultBadge: {
    color: FRANK_COLORS.orange,
    fontSize: 14,
  },
  addressText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  instructions: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: FRANK_COLORS.bgSecondary,
  },
  actionButtonText: {
    color: FRANK_COLORS.orange,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: FRANK_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalForm: {
    padding: 16,
  },
  input: {
    backgroundColor: FRANK_COLORS.bgSecondary,
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  saveButton: {
    backgroundColor: FRANK_COLORS.orange,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
