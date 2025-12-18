# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MESOB is an enterprise-level food ordering platform built with the MERN stack (MongoDB, Express, React, Node.js). The platform supports three distinct user roles (Customer, Restaurant Owner, Admin) with dedicated dashboards for each. Key features include real-time order tracking via Socket.IO, comprehensive reviews & ratings, notifications, analytics, and Stripe payment processing.

## Architecture

### Monorepo Structure
This is a **workspace-based monorepo** (not using Turborepo or Lerna):
- `apps/` - Contains three frontend applications (customer-web, admin-dashboard, driver-web)
- `backend/` - Express.js API server with Socket.IO integration
- `packages/` - Shared code (types, constants, utils)

**Critical**: Frontend apps and backend are separate workspaces. When running commands in a specific workspace, use `cd` to navigate to the workspace directory or use npm workspace flags.

### Backend Architecture (Express.js + TypeScript)
- **Entry point**: `backend/src/server.ts` (handles MongoDB connection, port binding)
- **App setup**: `backend/src/app.ts` (Express app, Socket.IO server, routes, middleware)
- **Structure**:
  - `controllers/` - Business logic for each resource
  - `models/` - Mongoose schemas and models
  - `routes/` - API route definitions
  - `middleware/` - Authentication (`protect`, `requirePermission`, `requireRole`), validation
  - `config/` - Database connection, permissions system
  - `scripts/` - Database seeding scripts for all user roles

### Frontend Architecture (React + TypeScript + Vite)
- **Build tool**: Vite (NOT Create React App)
- **State Management**: 
  - Redux Toolkit for auth and cart state (`store/slices/`)
  - React Query (`@tanstack/react-query`) for server state/data fetching
- **UI**: Material-UI (MUI) v5
- **Structure** (apps/customer-web/src/):
  - `pages/` - Route components
  - `components/` - Reusable UI components
  - `store/` - Redux store and slices (authSlice, cartSlice)
  - `services/` - API service functions
  - `hooks/` - Custom React hooks
  - `features/` - Feature-specific components/logic
  - `validators/` - Form validation schemas (Yup/Zod)

### Shared Packages
- `@food-ordering/types` - Shared TypeScript types/interfaces
- `@food-ordering/constants` - Enums (UserRole, OrderStatus, RestaurantStatus, NotificationType)
- `@food-ordering/utils` - Shared utility functions

**Important**: These packages are referenced directly via TypeScript source files (`"main": "src/index.ts"`), not built distributions.

## Key Technologies & Patterns

### Role-Based Access Control (RBAC)
The backend uses a **permissions-based RBAC system** defined in `backend/src/config/permissions.ts`:
- **Roles**: `CUSTOMER`, `RESTAURANT_OWNER`, `DRIVER`, `ADMIN` (from `@food-ordering/constants`)
- **Middleware**:
  - `protect` - JWT authentication (attaches `req.user`)
  - `requirePermission(permission)` - Check specific permissions
  - `requireRole(role)` - Check specific role
  - `validateOwnership(modelName)` - Verify resource ownership (restaurant, product, order)

**Pattern**: Always use `protect` first, then add role/permission checks. Example:
```typescript
router.post('/restaurants', protect, requirePermission(Permission.CREATE_RESTAURANT), createRestaurant);
```

### Real-time Communication (Socket.IO)
- Socket.IO server is attached to the HTTP server in `backend/src/app.ts`
- **Important**: Socket.IO instance is stored on Express app: `app.set('io', io)`
- Controllers access it via: `const io = req.app.get('io')`
- **Room patterns**:
  - User-specific: `io.to(userId).emit('notification', data)`
  - Restaurant-specific: `io.to(`restaurant-${restaurantId}`).emit('orderUpdate', data)`
- **Client events**: `join` (user room), `joinRestaurant` (restaurant dashboard room)
- **Use cases**: Order status updates, notifications, real-time analytics

### Notifications System
Notifications are created via `createNotification` helper in `notificationController.ts`:
- **11 notification types** defined in `NotificationType` enum (ORDER_PLACED, ORDER_CONFIRMED, ORDER_PREPARING, ORDER_READY, ORDER_OUT_FOR_DELIVERY, ORDER_DELIVERED, ORDER_CANCELLED, PROMOTION, NEW_RESTAURANT, REVIEW_RESPONSE, SYSTEM)
- Automatically sends real-time notification via Socket.IO when created
- Includes optional metadata: `relatedOrder`, `relatedRestaurant`, `actionUrl`, `imageUrl`

### Authentication Flow
- JWT tokens stored in `localStorage` (frontend)
- Backend extracts from `Authorization: Bearer <token>` header
- User object attached to `req.user` by `protect` middleware
- Frontend auth state managed in Redux (`authSlice.ts`)

## Common Development Commands

### Full Stack Development
```bash
# Install all dependencies (from root)
npm install

# Start all services (backend + customer-web + admin-dashboard)
npm run dev

# Start individual services
npm run dev:backend    # Backend only
npm run dev:customer   # Customer web only
npm run dev:admin      # Admin dashboard only

# Or navigate to specific workspace
cd backend && npm run dev
cd apps/customer-web && npm run dev
cd apps/admin-dashboard && npm run dev
cd apps/driver-web && npm run dev
```

### Backend Development
```bash
cd backend

# Development with hot reload (nodemon)
npm run dev

# Build TypeScript
npm run build

# Production start (requires build first)
npm start

# Database seeding
npm run seed:admin      # Create admin user
npm run seed:owner      # Create restaurant owner
npm run seed:customer   # Create customer
npm run seed:driver     # Create driver
npm run seed:all        # Seed all user types

# Tests (if configured)
npm test
```

### Frontend Development
```bash
cd apps/customer-web  # or admin-dashboard or driver-web

# Development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint TypeScript/TSX files
npm run lint
```

### Linting & Formatting
```bash
# From root (lints all workspaces)
npm run lint

# Specific workspace
cd backend && npm run lint
cd apps/customer-web && npm run lint
```

### Testing
```bash
# Run tests in all workspaces
npm run test --workspaces

# Run tests in specific workspace
cd backend && npm test
cd apps/customer-web && npm test
```

**Note**: Test framework is Jest (configured in package.json), but test files may not be fully implemented yet.

## Environment Variables

### Backend (.env in backend/)
Required variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mesob-food-ordering
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env in apps/customer-web/, apps/admin-dashboard/, apps/driver-web/)
```
VITE_API_URL=http://localhost:5000
```

**Important**: Frontend uses Vite, so env vars must be prefixed with `VITE_`.

## API Patterns & Conventions

### Route Structure
Routes follow RESTful patterns:
- `/api/auth/*` - Authentication (register, login)
- `/api/restaurants/*` - Restaurant CRUD
- `/api/restaurants/:restaurantId/products` - Menu items (nested under restaurant)
- `/api/restaurants/:restaurantId/categories` - Menu categories
- `/api/orders/*` - Order management
- `/api/reviews/*` - Reviews & ratings
- `/api/notifications/*` - User notifications
- `/api/analytics/*` - Analytics endpoints (admin, restaurant-specific)
- `/api/payments/*` - Stripe payment processing
- `/api/users/*` - User management
- `/api/profile/*` - User profile operations

### Response Format
Standard response structure:
```typescript
// Success
{ status: 'success', data: { ... } }

// Error
{ status: 'fail', message: 'Error description' }

// Legacy endpoints may use
{ success: true/false, data/message: ... }
```

### Error Handling
- Mongoose validation errors return 400
- Authentication failures return 401
- Authorization failures return 403
- Resource not found returns 404
- Server errors return 500

## Database (MongoDB + Mongoose)

### Connection
- Configuration in `backend/src/config/db.ts`
- Connection established in `server.ts` before starting HTTP server
- Uses async/await pattern with error handling

### Key Models
- `User` - All user types (role field discriminates)
- `Restaurant` - Restaurant data and ownership
- `Product` - Menu items (belongs to restaurant)
- `Order` - Orders with items, status tracking
- `Review` - Multi-level ratings (food, service, delivery)
- `Notification` - User notifications with Socket.IO integration
- `Category` - Menu item categories

### Indexes
Models include strategic indexes for performance:
- `Notification`: `{ user: 1, createdAt: -1 }`, `{ user: 1, isRead: 1 }`
- Check individual model files for other indexes

## Development Guidelines

### When Adding New Features

1. **For API endpoints**:
   - Add model in `backend/src/models/` (with Mongoose schema)
   - Add controller in `backend/src/controllers/` (business logic)
   - Add route in `backend/src/routes/` (route definitions with middleware)
   - Mount route in `backend/src/app.ts`
   - Add proper authentication/authorization middleware
   - Consider Socket.IO events for real-time updates

2. **For frontend features**:
   - Add React Query hooks in `services/` for API calls
   - Create components in `components/` or `features/`
   - Add pages in `pages/` if new routes needed
   - Update Redux slices if global state needed
   - Use Material-UI components for consistency

3. **For shared code**:
   - Add types to `packages/types/src/index.ts`
   - Add constants/enums to `packages/constants/src/index.ts`
   - Import using `@food-ordering/types` or `@food-ordering/constants`

### Socket.IO Integration
When adding real-time features:
1. Get Socket.IO instance: `const io = req.app.get('io')`
2. Emit to specific rooms: `io.to(userId).emit('eventName', data)`
3. Frontend connects in component mount/useEffect
4. Remember to handle disconnections and cleanup

### Payment Integration (Stripe)
- Stripe is configured for payment processing
- Frontend uses `@stripe/react-stripe-js` and `@stripe/stripe-js`
- Backend uses `stripe` SDK with secret key from env
- Payment routes in `/api/payments/*`

### Form Validation
- Backend: Zod schemas (`zod` package version 4.x)
- Frontend: Yup schemas in `validators/` directory, used with Formik
- Consider creating shared validation schemas in `packages/` for consistency

## Important Notes

- **Port conflicts**: Backend server auto-retries on next port if 5000 is busy (see `server.ts`)
- **CORS**: Backend allows all origins by default (`cors()`), configure `CORS_ORIGIN` for production
- **File uploads**: Cloudinary integration exists (check `uploadRoutes.ts` and `upload.ts` middleware)
- **Slugification**: Uses `slugify` package for URL-friendly identifiers
- **Security**: Uses `helmet` for HTTP headers, `bcryptjs` for password hashing
- **Logging**: Uses `morgan` for HTTP request logging in development

## Resources

- README.md - Full feature list, setup instructions, API documentation
- ENTERPRISE_FEATURES.md - Roadmap of planned features
- IMPLEMENTATION_SUMMARY.md - Implementation details and progress

## TypeScript Configuration

- Root `tsconfig.json` with workspace-specific extensions
- Backend compiles to `dist/` directory
- Frontend uses Vite's built-in TS compilation (no separate tsc build)
- Shared packages use TypeScript source files directly (not compiled)
