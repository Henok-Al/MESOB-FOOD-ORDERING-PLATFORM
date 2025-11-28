# Mesob Food Ordering Platform

Enterprise-level food ordering and delivery platform built with the MERN stack (MongoDB, Express.js, React, Node.js) in a monorepo architecture.

## 🏗️ Architecture

This project uses a **monorepo structure** with npm workspaces, containing:

- **7 Backend Microservices** (Node.js + Express + MongoDB)
- **3 Web Applications** (React + Vite)
- **2 Mobile Applications** (React Native + Expo)
- **1 Shared Package** (Common utilities and types)

## 📦 Project Structure

```
mesob-food-ordering/
├── packages/
│   ├── shared/                    # Shared utilities, constants, types
│   ├── auth-service/              # Authentication & authorization
│   ├── restaurant-service/        # Restaurant & menu management
│   ├── order-service/             # Order processing & tracking
│   ├── payment-service/           # Payment processing (Stripe)
│   ├── delivery-service/          # Driver assignment & tracking
│   ├── notification-service/      # Email, SMS, push notifications
│   ├── location-service/          # GPS & geolocation
│   ├── analytics-service/         # Analytics & reporting
│   ├── customer-web/              # Customer web application
│   ├── restaurant-dashboard/      # Restaurant management portal
│   ├── admin-dashboard/           # Platform admin portal
│   ├── customer-mobile/           # Customer mobile app (React Native)
│   └── driver-mobile/             # Driver mobile app (React Native)
├── infrastructure/
│   ├── docker/                    # Docker configurations
│   └── nginx/                     # Nginx configurations
└── docs/                          # Documentation

```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0
- Redis >= 7.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mesob-food-ordering
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB and Redis**
   ```bash
   # Using Docker
   docker-compose up -d mongodb redis
   
   # Or install locally
   ```

5. **Run all services in development mode**
   ```bash
   npm run dev
   ```

### Running Individual Services

```bash
# Backend services
npm run dev:auth              # Auth service (Port 5001)
npm run dev:restaurant        # Restaurant service (Port 5003)
npm run dev:order             # Order service (Port 5004)
npm run dev:payment           # Payment service (Port 5005)
npm run dev:delivery          # Delivery service (Port 5006)

# Frontend applications
npm run dev:customer-web           # Customer web (Port 3000)
npm run dev:restaurant-dashboard   # Restaurant dashboard (Port 3001)
npm run dev:admin-dashboard        # Admin dashboard (Port 3002)
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Cache:** Redis
- **Real-time:** Socket.io
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi / Express Validator
- **Testing:** Jest + Supertest

### Frontend (Web)
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Data Fetching:** React Query / Axios
- **Routing:** React Router v6
- **Forms:** Formik + Yup

### Mobile
- **Framework:** React Native
- **Platform:** Expo
- **Navigation:** React Navigation
- **State Management:** Redux Toolkit
- **Maps:** react-native-maps

### Third-Party Integrations
- **Payment:** Stripe
- **Maps:** Google Maps API
- **SMS:** Twilio
- **Email:** SendGrid / NodeMailer
- **Push Notifications:** Firebase Cloud Messaging
- **Image Storage:** Cloudinary / AWS S3

## 📋 Available Scripts

```bash
# Development
npm run dev                   # Run all services concurrently
npm run dev:auth             # Run auth service only
npm run dev:customer-web     # Run customer web app only

# Testing
npm test                     # Run all tests
npm run test:coverage        # Run tests with coverage

# Linting & Formatting
npm run lint                 # Lint all packages
npm run format               # Format code with Prettier

# Build
npm run build                # Build all packages for production
```

## 🔑 Key Features

### Customer Features
- 🔍 Restaurant search and filtering
- 🛒 Shopping cart management
- 💳 Multiple payment methods
- 📍 Real-time order tracking
- ⭐ Ratings and reviews
- 🎁 Promotions and discounts

### Restaurant Features
- 📋 Order management dashboard
- 🍕 Menu management
- 📊 Sales analytics
- ⏰ Operating hours control
- 💰 Revenue tracking

### Driver Features
- 📱 Mobile app for deliveries
- 🗺️ GPS navigation
- 💵 Earnings tracking
- 📦 Delivery history

### Admin Features
- 👥 User management
- 🏪 Restaurant approval
- 🚚 Driver verification
- 💰 Financial management
- 📊 Platform analytics

## 🏛️ Architecture Patterns

- **Microservices Architecture:** Independent, loosely coupled services
- **MVC Pattern:** Model-View-Controller for each service
- **Repository Pattern:** Data access abstraction
- **Event-Driven:** Real-time updates with Socket.io
- **API Gateway Pattern:** Centralized API routing (optional)

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers
- Password hashing with bcrypt
- Secure payment processing

## 📚 Documentation

- [Research Findings](/.gemini/antigravity/brain/caba9d8f-13ab-43ba-9ae2-28e24d2f9343/research_findings.md)
- [Implementation Plan](/.gemini/antigravity/brain/caba9d8f-13ab-43ba-9ae2-28e24d2f9343/implementation_plan.md)
- [Architecture Diagrams](/.gemini/antigravity/brain/caba9d8f-13ab-43ba-9ae2-28e24d2f9343/architecture_diagrams.md)
- [Step-by-Step Build Schedule](/.gemini/antigravity/brain/caba9d8f-13ab-43ba-9ae2-28e24d2f9343/step_by_step_build_schedule.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

- Backend Developers
- Frontend Developers
- Mobile Developers
- DevOps Engineers
- UI/UX Designers

## 📞 Support

For support, email support@mesob-food.com or open an issue.

---

**Built with ❤️ using the MERN Stack**
