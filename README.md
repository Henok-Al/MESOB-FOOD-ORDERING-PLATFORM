# MESOB Food Ordering Platform

A comprehensive, enterprise-level food ordering platform built with the MERN stack, featuring real-time order tracking, reviews & ratings, notifications, and analytics.

## 🚀 Features

### For Customers
- 🔍 **Restaurant Discovery** - Search and filter restaurants by cuisine, rating, delivery time
- 🛒 **Smart Cart** - Add items, manage quantities, checkout seamlessly
- 📍 **Address Management** - Save multiple delivery addresses
- 📦 **Real-time Order Tracking** - Track orders with live status updates
- ⭐ **Reviews & Ratings** - Leave detailed reviews with multi-level ratings
- 🔔 **Instant Notifications** - Get notified about order status changes
- 🔄 **Quick Reorder** - One-click reorder from order history
- ❌ **Order Cancellation** - Cancel orders before preparation

### For Restaurants
- 📊 **Analytics Dashboard** - Track revenue, popular items, customer satisfaction
- 🍽️ **Menu Management** - Full CRUD operations for menu items
- 📋 **Order Management** - Accept, prepare, and track orders
- 💬 **Review Responses** - Respond to customer reviews
- 📈 **Performance Metrics** - View sales trends and ratings

### For Admins
- 👥 **User Management** - Manage users and roles
- 🏪 **Restaurant Management** - Approve and manage restaurants
- 📊 **Comprehensive Analytics** - Platform-wide metrics and reports
- 💰 **Revenue Tracking** - Monitor revenue across all restaurants
- 📝 **Review Moderation** - Moderate inappropriate reviews

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** & **Mongoose** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Stripe** - Payment processing

### Frontend
- **React** & **TypeScript** - UI framework
- **Material-UI** - Component library
- **Redux Toolkit** - State management
- **React Query** - Data fetching
- **Socket.IO Client** - Real-time updates

### Architecture
- **Monorepo** - Organized with workspaces
- **Shared Packages** - Types and constants
- **RBAC** - Role-based access control
- **RESTful API** - Clean API design

## 📁 Project Structure

```
mesob-food-ordering/
├── apps/
│   ├── admin-dashboard/      # Admin web application
│   ├── customer-web/          # Customer web application
│   └── restaurant-dashboard/  # Restaurant web application
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, validation, etc.
│   │   └── config/            # Configuration
│   └── server.ts
├── packages/
│   ├── types/                 # Shared TypeScript types
│   └── constants/             # Shared constants
└── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Henok-Al/MESOB-FOOD-ORDERING-PLATFORM.git
cd mesob-food-ordering
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mesob-food-ordering
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Create `.env` files in each app directory:
```env
VITE_API_URL=http://localhost:5000
```

4. **Start MongoDB**
```bash
mongod
```

5. **Run the application**

Backend:
```bash
cd backend
npm run dev
```

Customer Web:
```bash
cd apps/customer-web
npm run dev
```

Admin Dashboard:
```bash
cd apps/admin-dashboard
npm run dev
```

Restaurant Dashboard:
```bash
cd apps/restaurant-dashboard
npm run dev
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Orders
- `GET /api/orders/myorders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id/tracking` - Track order
- `PATCH /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/reorder` - Reorder
- `PATCH /api/orders/:id/status` - Update status (Admin/Restaurant)

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
- `GET /api/reviews/my-reviews` - Get user's reviews
- `POST /api/reviews/:id/respond` - Restaurant response
- `POST /api/reviews/:id/helpful` - Mark helpful

### Notifications
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Analytics
- `GET /api/analytics/admin/dashboard` - Admin metrics
- `GET /api/analytics/restaurant/:restaurantId` - Restaurant stats
- `GET /api/analytics/revenue` - Revenue reports

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `POST /api/restaurants` - Create restaurant (Admin)
- `PATCH /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Products (Menu Items)
- `GET /api/restaurants/:id/products` - Get restaurant menu
- `POST /api/restaurants/:id/products` - Add menu item
- `PATCH /api/restaurants/:id/products/:productId` - Update item
- `DELETE /api/restaurants/:id/products/:productId` - Delete item

## 🔐 Roles & Permissions

### Customer
- Browse restaurants
- Place orders
- Track orders
- Leave reviews
- Manage profile

### Restaurant Owner
- Manage menu
- View orders
- Update order status
- Respond to reviews
- View analytics

### Admin
- Manage users
- Manage restaurants
- View all orders
- Moderate reviews
- Access analytics

## 🎯 Key Features Implementation

### Real-time Order Tracking
- Socket.IO integration for live updates
- Progress stepper UI showing order flow
- Automatic notifications on status changes
- Status history with timestamps

### Reviews & Ratings
- Multi-level ratings (food, service, delivery)
- Photo uploads support
- Restaurant responses
- Helpful voting system
- Automatic rating calculation

### Notifications System
- 11 notification types
- Real-time delivery via Socket.IO
- Mark as read/unread
- Click to navigate to related content

### Analytics
- Revenue tracking and trends
- Popular items analysis
- Customer satisfaction metrics
- Date range filtering

## 📈 Enterprise Features Roadmap

See [ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md) for the complete roadmap of 27 feature categories including:
- Loyalty & Rewards
- Multiple Payment Methods
- Driver Management
- Scheduled Orders
- Group Orders
- Catering Module
- And more...

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd apps/customer-web
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please contact: [your-email@example.com]

## 🙏 Acknowledgments

- Material-UI for the component library
- Socket.IO for real-time features
- Stripe for payment processing
- MongoDB for the database

---

**Built with ❤️ for the food delivery industry**
