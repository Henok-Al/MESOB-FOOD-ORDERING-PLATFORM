# Driver Mobile App

React Native Expo mobile app for delivery drivers.

## Features

- **Authentication**: Secure login for drivers
- **Orders Management**: View available orders and active deliveries
- **Order Actions**: Accept orders, mark as picked up, mark as delivered
- **Earnings Tracking**: View total tips and delivery history
- **Online/Offline Toggle**: Control availability status
- **Real-time Updates**: React Query for data synchronization

## Tech Stack

- React Native (Expo SDK 50)
- React Navigation (Bottom Tabs + Native Stack)
- TanStack React Query
- Axios
- AsyncStorage

## Getting Started

### Prerequisites

- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
cd apps/driver-mobile
npm install
```

### Environment Variables

Create `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:5001
```

> **Note**: For iOS Simulator, use `localhost`. For Android Emulator, use `10.0.2.2`. For physical devices, use your computer's IP address.

### Running the App

```bash
# Start the app
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android
```

## Project Structure

```
src/
├── api.ts              # Axios instance with auth interceptors
├── context/
│   └── AuthContext.tsx # Authentication state management
├── navigation/
│   └── MainTabs.tsx    # Bottom tab navigation
└── screens/
    ├── LoginScreen.tsx    # Driver login
    ├── OrdersScreen.tsx   # Available & active orders
    ├── EarningsScreen.tsx # Earnings tracking
    └── ProfileScreen.tsx  # Profile & availability
```

## API Endpoints

The app uses these backend endpoints:

- `POST /api/auth/login` - Authentication
- `GET /api/auth/me` - Get current user
- `GET /api/driver/orders/available` - Available orders
- `GET /api/driver/orders/active` - Active deliveries
- `PATCH /api/driver/orders/:id/accept` - Accept order
- `PATCH /api/driver/orders/:id/status` - Update order status
- `GET /api/driver/earnings` - Driver earnings
- `PATCH /api/driver/availability` - Update availability

## Future Enhancements

- [ ] Real-time location tracking with expo-location
- [ ] Push notifications with expo-notifications
- [ ] Maps integration with react-native-maps
- [ ] Delivery photo capture
- [ ] Offline mode support
