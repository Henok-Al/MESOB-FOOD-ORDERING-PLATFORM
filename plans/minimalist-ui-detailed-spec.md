# Minimalist UI Design Specification

## Design Philosophy

**Core Principles:**

- Whitespace dominance for visual breathing room
- Simplified color palette with white as primary background
- Flat design with minimal shadows and depth
- Consistent spacing system (8px increments)
- Clean, readable typography with proper hierarchy
- Subtle, functional animations only

## Color Palette

### Primary Colors

- **Background:** `#ffffff` (Pure white)
- **Text Primary:** `#1a1a1a` (Deep black)
- **Text Secondary:** `#666666` (Medium gray)
- **Text Disabled:** `#b0b0b0` (Light gray)

### Accent Colors

- **Primary Action:** `#1a1a1a` (Black for buttons)
- **Secondary Action:** `#f5f5f5` (Off-white)
- **Hover State:** `#e0e0e0` (Light gray)
- **Active State:** `#0a0a0a` (Darker black)

### Borders and Dividers

- **Border Color:** `#e0e0e0` (Light gray)
- **Divider:** `rgba(0, 0, 0, 0.08)` (Subtle divider)

## Typography

### Font Family

```css
font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
```

### Font Weights

- **Headings:** 600 (Semi-bold)
- **Body:** 400 (Regular)
- **Buttons:** 500 (Medium)

### Font Sizes

- **H1:** 2.5rem (40px)
- **H2:** 2rem (32px)
- **H3:** 1.75rem (28px)
- **H4:** 1.5rem (24px)
- **H5:** 1.25rem (20px)
- **H6:** 1.125rem (18px)
- **Body1:** 1rem (16px)
- **Body2:** 0.875rem (14px)
- **Button:** 0.875rem (14px)

### Line Heights

- **Headings:** 1.3
- **Body:** 1.6
- **Buttons:** 1.5

## Spacing System

### Base Unit: 8px

- **Spacing Scale:** 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128px
- **Padding:** Consistent 24px internal padding for containers
- **Margins:** 48px-96px between major sections

## Component Specifications

### Buttons

**Primary Button:**

```css
background: #1a1a1a;
color: #ffffff;
border: 1px solid #1a1a1a;
border-radius: 4px;
padding: 10px 24px;
font-weight: 500;
font-size: 0.875rem;
transition: all 0.2s ease;

&:hover {
  background: #0a0a0a;
  transform: translateY(-1px);
}

&:active {
  transform: translateY(0);
}
```

**Secondary Button:**

```css
background: transparent;
color: #1a1a1a;
border: 1px solid #e0e0e0;
border-radius: 4px;
padding: 10px 24px;
font-weight: 500;
font-size: 0.875rem;
transition: all 0.2s ease;

&:hover {
  background: #f5f5f5;
  border-color: #1a1a1a;
}
```

### Cards

**Standard Card:**

```css
background: #ffffff;
border: 1px solid #e0e0e0;
border-radius: 8px;
box-shadow: none;
padding: 24px;
transition: all 0.2s ease;

&:hover {
  border-color: #1a1a1a;
  transform: translateY(-2px);
}
```

### Navigation

**Navbar:**

```css
background: #ffffff;
border-bottom: 1px solid #e0e0e0;
height: 64px;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Active link indicator */
.active-link {
  border-bottom: 2px solid #1a1a1a;
  font-weight: 600;
}
```

### Input Fields

**Text Input:**

```css
border: 1px solid #e0e0e0;
border-radius: 4px;
padding: 12px 16px;
font-size: 0.875rem;
background: #ffffff;
transition: all 0.2s ease;

&:focus {
  border-color: #1a1a1a;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 26, 26, 0.1);
}
```

## Layout Specifications

### Main Layout

```css
min-height: 100vh;
display: flex;
flex-direction: column;
background: #ffffff;
```

### Container

```css
max-width: 1200px;
margin: 0 auto;
padding: 0 24px;
```

### Grid System

```css
/* 12-column grid with 16px gutters */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
```

## Page-Specific Designs

### Home Page

**Hero Section:**

- Clean white background
- Simple headline with black text
- Minimalist search bar with subtle border
- No decorative elements or animations

**Featured Restaurants:**

- Grid layout with 4 columns on desktop, 2 on mobile
- Clean white cards with subtle borders
- Restaurant name in bold black text
- Rating and cuisine in medium gray

### Restaurant Details Page

**Header:**

- Restaurant name in H1 (2.5rem)
- Rating and delivery info in medium gray
- Simple horizontal divider

**Menu Items:**

- Clean grid layout
- Product cards with white background
- Subtle borders and minimal shadows
- Clear pricing and add-to-cart buttons

### Checkout Page

**Form Layout:**

- Simple two-column layout
- Clean input fields with subtle borders
- Clear section headings
- Minimalist order summary

## Animation Guidelines

### Permitted Animations

- **Hover States:** Subtle transform and color changes
- **Page Transitions:** Simple fade or slide (200-300ms)
- **Loading States:** Minimal spinner or progress bar

### Prohibited Animations

- Complex gradients and background animations
- Bounce or pulse effects
- Auto-playing animations
- Decorative floating elements

## Implementation Checklist

- [ ] Update theme.ts with new color palette
- [ ] Apply new typography system
- [ ] Redesign all buttons to flat style
- [ ] Update card components with minimalist styling
- [ ] Simplify navigation with clean borders
- [ ] Standardize input fields
- [ ] Implement consistent spacing system
- [ ] Remove all prohibited animations
- [ ] Test responsive behavior
- [ ] Verify accessibility compliance

## Approval

This specification outlines a comprehensive approach to transforming the UI into a clean, minimalist white-themed design. The focus is on simplicity, usability, and visual clarity while maintaining all existing functionality.

**Next Steps:**

1. Review and approve this specification
2. Proceed with implementation starting with theme updates
3. Apply component-by-component transformations
4. Test and refine the design

Would you like to proceed with this detailed specification or make any adjustments?
