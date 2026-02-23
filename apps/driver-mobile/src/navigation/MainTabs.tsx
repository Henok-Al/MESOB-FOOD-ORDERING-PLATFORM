import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import OrdersScreen from '../screens/OrdersScreen';
import DriverStatusScreen from '../screens/DriverStatusScreen';
import DriverWalletScreen from '../screens/DriverWalletScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Orders') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Status') {
            iconName = focused ? 'radio-button-on' : 'radio-button-off';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fffaf3',
        },
        headerTitleStyle: {
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ title: 'Deliveries' }} 
      />
      <Tab.Screen 
        name="Status" 
        component={DriverStatusScreen} 
        options={{ title: 'Online Status' }} 
      />
      <Tab.Screen 
        name="Wallet" 
        component={DriverWalletScreen} 
        options={{ title: 'Wallet' }} 
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen} 
        options={{ title: 'Earnings' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Tab.Navigator>
  );
}
