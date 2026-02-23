# FRANK Design System Implementation

## Overview
All applications have been updated with the **FRANK by БАСТА** design system - a bold, dark-themed street-food aesthetic with orange accents.

## Design Tokens

### Colors
```
Primary:     #f97316 (Orange)
Dark:        #ea580c (Orange Dark)
Light:       #fb923c (Orange Light)
Success:     #22c55e (Green for NEW badges)

Background:
  - Primary:   #0a0a0a (Pure black)
  - Secondary: #111111
  - Card:      #1a1a1a
  - Elevated:  #262626

Text:
  - Primary:   #ffffff
  - Secondary: #a3a3a3
  - Muted:     #737373

Border: #333333
```

### Typography
- **Font Family**: Inter, SF Pro Display, system-ui
- **Headings**: Uppercase, bold (700-800 weight), tight letter-spacing
- **Buttons**: Uppercase, bold, tracking-wider

## Implementation Status

### ✅ Customer Web (React + MUI)
**Location**: `apps/customer-web/src/theme.ts`
- Dark theme with orange primary color
- Uppercase headings throughout
- Orange scrollbar styling
- Card hover effects with dark backgrounds

### ✅ Admin Dashboard (React + Tailwind)
**Location**: `apps/admin-dashboard/`
- Tailwind config with FRANK colors
- Global CSS with CSS variables
- Utility classes: `.frank-card`, `.frank-button`, `.frank-input`

### ✅ Driver Mobile (React Native + Expo)
**Location**: `apps/driver-mobile/src/`
- Theme constants in `theme.ts`
- All screens updated:
  - `LoginScreen.tsx` - Dark login form
  - `OrdersScreen.tsx` - Active/Available orders
  - `EarningsScreen.tsx` - Earnings tracking
  - `ProfileScreen.tsx` - Profile & availability

### ✅ Shared Constants
**Location**: `packages/constants/src/frankTheme.ts`
- Exported as `FRANK_COLORS`, `FRANK_TYPOGRAPHY`, etc.
- Used by all apps for consistency

## Key Design Features

1. **Dark Theme**: Pure black (#0a0a0a) background
2. **Orange Accents**: Primary actions, highlights, scrollbars
3. **Uppercase Typography**: All headings and button labels
4. **Bold Font Weights**: 700-800 for impact
5. **Green Badges**: "NEW" indicators and success states
6. **Border Contrast**: Subtle #333 borders on cards

## Usage Examples

### React (MUI)
```tsx
import { FRANK_COLORS } from '@food-ordering/constants';

<Button sx={{ bgcolor: FRANK_COLORS.orange }}>
  PLACE ORDER
</Button>
```

### Tailwind
```html
<button class="frank-button">
  PLACE ORDER
</button>
<div class="frank-card">
  <h2 class="frank-heading">RIBS</h2>
</div>
```

### React Native
```tsx
import { FRANK_COLORS } from '../theme';

<View style={{ backgroundColor: FRANK_COLORS.bgCard }}>
  <Text style={{ color: FRANK_COLORS.orange }}>
    ORDER NOW
  </Text>
</View>
```

## Reference
Based on: https://frankmeat.ru/en
