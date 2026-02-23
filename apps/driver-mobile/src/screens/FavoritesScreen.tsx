import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FRANK_COLORS } from '../theme';

interface Restaurant {
  _id: string;
  name: string;
  imageUrl: string;
  cuisine: string;
  rating: number;
  address: string;
}

interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  price: number;
  restaurant: string;
}

export default function FavoritesScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = React.useState<'restaurants' | 'products'>('restaurants');
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setRestaurants(response.data.data.restaurants || []);
      setProducts(response.data.data.products || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeRestaurantFavorite = async (id: string) => {
    try {
      await api.delete(`/favorites/restaurant/${id}`);
      setRestaurants(restaurants.filter((r) => r._id !== id));
      Alert.alert('Success', 'Removed from favorites');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove');
    }
  };

  const removeProductFavorite = async (id: string) => {
    try {
      await api.delete(`/favorites/product/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      Alert.alert('Success', 'Removed from favorites');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove');
    }
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
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'restaurants' && styles.activeTab]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text style={[styles.tabText, activeTab === 'restaurants' && styles.activeTabText]}>
            Restaurants ({restaurants.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
            Dishes ({products.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'restaurants' ? (
          restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={FRANK_COLORS.border} />
              <Text style={styles.emptyText}>No favorite restaurants yet</Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
              </TouchableOpacity>
            </View>
          ) : (
            restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant._id}
                style={styles.card}
                onPress={() => navigation.navigate('RestaurantDetails', { id: restaurant._id })}
              >
                <Image source={{ uri: restaurant.imageUrl }} style={styles.restaurantImage} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.restaurantName}>{restaurant.name}</Text>
                      <Text style={styles.restaurantInfo}>{restaurant.cuisine}</Text>
                      <Text style={styles.restaurantInfo}>{restaurant.address}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeRestaurantFavorite(restaurant._id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color={FRANK_COLORS.orange} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={FRANK_COLORS.border} />
            <Text style={styles.emptyText}>No favorite dishes yet</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreButtonText}>Explore Menu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((product) => (
            <View key={product._id} style={styles.card}>
              <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeProductFavorite(product._id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.viewRestaurantButton}
                  onPress={() => navigation.navigate('RestaurantDetails', { id: product.restaurant })}
                >
                  <Text style={styles.viewRestaurantText}>View Restaurant</Text>
                  <Ionicons name="arrow-forward" size={16} color={FRANK_COLORS.orange} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: FRANK_COLORS.bgCard,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: FRANK_COLORS.orange,
  },
  tabText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
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
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: FRANK_COLORS.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: FRANK_COLORS.bgCard,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FRANK_COLORS.border,
  },
  restaurantImage: {
    width: '100%',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  restaurantInfo: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FRANK_COLORS.orange,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  viewRestaurantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FRANK_COLORS.border,
  },
  viewRestaurantText: {
    fontSize: 14,
    color: FRANK_COLORS.orange,
    marginRight: 4,
  },
});
