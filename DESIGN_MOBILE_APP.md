# Smart Supply Sourcing — Mobile App Design Document

## Overview

A native mobile-first application for iOS and Android that provides the same B2B industrial equipment sourcing capabilities as the web platform, optimized for on-the-go use by buyers in Kenya and East Africa.

---

## Core Principles

1. **Mobile-First Design**: Touch-optimized interactions, thumb-friendly layouts
2. **Progressive Enhancement**: Core features work offline, enhanced when online
3. **Performance**: Fast load times, optimized data fetching, image lazy loading
4. **Consistency**: Same brand identity, color palette, and terminology as web
5. **Context-Aware**: Location-based features, push notifications, camera integration

---

## Tech Stack Recommendations

### Cross-Platform Framework

- **React Native** (TypeScript) - Same codebase for iOS and Android
- **Expo** - For rapid development, push notifications, camera, biometrics
- **Native Modules** - For advanced features (payment integrations, background sync)

### State Management

- **Zustand** (same as web) - Lightweight, familiar pattern
- **React Query** - Data fetching and caching

### Navigation

- **React Navigation** - Stack, tab, and drawer navigation

### UI Library

- **React Native Paper** or **Tamagui** - Component library matching web design system
- **Custom Components** - For brand-specific elements (teal color palette)

### Backend Integration

- Same Next.js API endpoints (REST or GraphQL)
- WebSocket for real-time order updates
- Push notifications via Expo/FCM

---

## App Architecture

```
src/
├── screens/               # Screen components (one file per screen)
│   ├── auth/
│   ├── home/
│   ├── catalog/
│   ├── cart/
│   ├── orders/
│   ├── sourcing/
│   ├── invoices/
│   ├── profile/
│   └── admin/            # Admin-specific screens (if needed)
├── components/            # Reusable UI components
│   ├── ui/               # Base components (buttons, inputs, cards)
│   ├── catalog/          # Product cards, filters, search
│   ├── cart/             # Cart items, summary
│   └── sourcing/         # Request forms, quote cards
├── hooks/                # Custom hooks (useCart, useAuth, useNotifications)
├── lib/                  # Shared utilities
│   ├── api/             # API client (axios/fetch)
│   ├── stores/          # Zustand stores (same as web)
│   └── utils/           # Helper functions
├── navigation/           # Navigation configuration
└── types/                # Shared TypeScript types (import from web)
```

---

## User Flows

### 1. Authentication Flow

```
Landing → [Login/Register] → Onboarding → Home
```

**Screens:**

- `AuthScreen` - Email/phone + password
- `OTPVerificationScreen` - SMS verification (optional, for phone login)
- `OnboardingScreen` - 3-4 slide intro (skipable)
- `ProfileSetupScreen` - Company name, contact info

**Features:**

- Biometric login (Face ID/Touch ID)
- "Remember me" with secure token storage
- Session refresh on app restart
- Logout with clear cache

---

### 2. Home Dashboard Flow

```
Home → [Quick Actions] → [Recent Activity] → [Notifications]
```

**Key Elements:**

- **Header**: Logo + profile avatar (tap → profile) + notifications bell
- **Welcome Banner**: "Hi [Name], ready to source?" + quick action button
- **KPI Cards** (horizontal scroll):
  - Outstanding Balance (teal)
  - Pending Reconciliation (amber)
  - Total Orders (blue)
  - Completed Orders (green)
- **Quick Actions Grid** (4 cards):
  - 📦 New Sourcing Request
  - 🛒 Browse Catalog
  - 📄 View Invoices
  - 💳 Payment History
- **Recent Activity Feed**:
  - Order updates (shipped, delivered)
  - Payment confirmations
  - Quote expirations
  - Sourcing request status changes
- **Bottom Nav**: Home | Catalog | Cart | Orders | Profile

**Design:**

- Card-based layout with rounded corners
- Pull-to-refresh on all lists
- Swipe gestures for quick actions (e.g., swipe to delete from cart)

---

### 3. Catalog Browsing Flow

```
Catalog → [Search/Filter] → Product List → Product Detail → [Add to Cart/Quote]
```

**Search & Filter:**

- **Search Bar**: Persistent at top, voice search support
- **Filter Drawer** (slide-up panel):
  - Category (multi-select)
  - Availability (in-stock, pre-order, all)
  - Price range (slider)
  - Payment method (M-Pesa, Bank)
  - Lead time
- **Filter Pills**: Active filters shown as removable chips

**Product List:**

- **Grid View** (2-3 columns):
  - Product image (aspect ratio 1:1)
  - Category badge
  - Product name (truncate if needed)
  - Price in KES
  - Availability badge (green/amber/red)
  - M-Pesa badge (if applicable)
- **List View** (optional toggle):
  - Horizontal layout with image on left
  - More details visible

**Product Detail:**

- **Image Carousel** (swipeable)
- **Info Section**:
  - SKU
  - Product name
  - Star rating
  - Price + "/Unit"
  - Payment method badges
  - Stock level
- **Actions**:
  - Quantity selector (stepper)
  - "Add to Cart" (teal)
  - "Request Quote" (outline)
  - "Share" (iOS/Android share sheet)
- **Tabs**:
  - Description
  - Specifications (scrollable table)
  - Shipping & Delivery
  - Vendor Info
- **Related Products** (horizontal scroll)

**Features:**

- Offline product cache
- Image zoom on tap
- Compare products (select 2-3 to compare)
- Save to favorites/wishlist

---

### 4. Shopping Cart Flow

```
Cart → [Edit Items] → [Proceed to Checkout]
```

**Cart Items:**

- Product thumbnail + name
- Unit price + quantity controls (stepper)
- Subtotal
- "Remove" button (trash icon, red on tap)
- Availability status indicator

**Order Summary** (sticky bottom):

- Subtotal
- Sourcing Fee (included)
- Estimated Shipping (at checkout)
- Total (highlighted)
- Payment method selector (M-Pesa/Bank)
- "Proceed to Checkout" button (teal, full width)

**Empty State:**

- Illustration + "Your cart is empty"
- "Browse Catalog" button

**Features:**

- Swipe to remove item
- Save for later (moves to wishlist)
- Apply promo code (if available)
- Split cart (for multiple destinations)

---

### 5. Checkout Flow

```
Checkout → [Shipping Address] → [Payment Method] → [Review] → [Confirm]
```

**Shipping Address:**

- Default address (if set)
- "Add New Address" button
- Map integration (select delivery location)
- Address fields: Street, City, Landmark, Phone

**Payment Method:**

- M-Pesa (default, preferred in Kenya)
  - Phone number input
  - "Send Payment Request" button
  - QR code option (scan M-Pesa prompt)
- Bank Transfer
  - Account details display
  - Upload payment proof (camera or gallery)
- Escrow option (if applicable)

**Review Order:**

- Order summary (items, quantities, prices)
- Shipping address
- Payment method
- Estimated delivery date
- Terms & conditions checkbox
- "Confirm Order" button

**Success Screen:**

- Order confirmation number
- Estimated delivery
- "Track Order" button
- "Continue Shopping" button
- Share order confirmation

---

### 6. Sourcing Request Flow

```
Sourcing → [Request Form] → [Media Upload] → [Logistics] → [Submit]
```

**Step 1: Item Details**

- Product name (required)
- Quantity (number input)
- Target price (optional)
- Technical specifications (textarea, expandable)
- "Add Reference Image" button (camera/gallery)

**Step 2: Reference Media**

- Image preview grid (max 5 images)
- Camera button (add new)
- Remove image (X icon)
- Image carousel (tap to view full size)

**Step 3: Logistics**

- Freight type (Air / Sea / Courier - segmented control)
- Destination city (autocomplete)
- Incoterms (checkboxes: FOB, CIF, DDP)
- Delivery timeline (date picker)

**Step 4: Compliance**

- Certification checkboxes (6 max):
  - ISO 9001
  - CE Certification
  - RoHS Compliance
  - Product Liability Insurance
  - Factory Audit Report
  - Other (text input)

**Step 5: Contact Info**

- Company name (auto-filled from profile)
- Contact person (auto-filled)
- Phone (auto-filled)
- Email (auto-filled)

**Review & Submit:**

- Summary card (teal background)
- Total estimated cost (if quotes available)
- "Submit Request" button (white)
- "Save Draft" button (outline)

**Features:**

- Progress indicator (1/5, 2/5, etc.)
- Auto-save drafts
- Camera integration for reference images
- Location autocomplete for destination
- Real-time cost estimation (if API available)

---

### 7. Order Tracking Flow

```
Orders → [Order Detail] → [Timeline] → [Payments] → [Support]
```

**Order Header:**

- Order number
- Status badge (color-coded)
- Estimated delivery date
- "Track Shipment" button (if shipped)

**Timeline:**

- Vertical timeline (similar to web):
  - Order Placed
  - Payment Received
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered
- Current step highlighted
- Date for each step

**Payments:**

- Payment method
- Amount
- Status (pending/completed/rejected)
- Payment proof (if uploaded)
- "Upload Proof" button (if pending)

**Actions:**

- Contact Seller (chat/email)
- Request Return/Refund
- Rate & Review
- Download Invoice
- Share Order

**Features:**

- Real-time status updates (push notifications)
- Map view for delivery tracking
- Estimated delivery countdown
- Export order details (PDF)

---

### 8. Invoices & Quotes Flow

```
Invoices → [Invoice List] → [Invoice Detail] → [Actions]
```

**Invoice List:**

- Filter tabs: All | Pending | Paid | Overdue
- Invoice cards:
  - Invoice number
  - Buyer name
  - Total amount
  - Status badge
  - Due date (if applicable)

**Invoice Detail:**

- Invoice header (number, date, status)
- Line items table
- Subtotal, tax, total
- Payment instructions
- Download button (PDF)
- Share button
- Pay now button (if pending)

**Quotes:**

- Same structure as invoices
- "Accept Quote" button (creates order)
- "Reject Quote" button
- "Request Revision" button

**Features:**

- Offline invoice cache
- QR code for quick payment
- Compare quotes (side-by-side)
- Export to Excel/PDF

---

### 9. Profile & Settings Flow

```
Profile → [Account Info] → [Preferences] → [Security] → [Help]
```

**Account Info:**

- Profile picture (tap to change)
- Name, email, phone
- Company name
- Edit button

**Preferences:**

- Language (English/Swahili)
- Currency (KES/USD)
- Notification settings (push, email, SMS)
- Dark mode toggle
- Data usage (low bandwidth mode)

**Security:**

- Change password
- Two-factor authentication
- Biometric login toggle
- Active sessions (logout all)

**Help & Support:**

- FAQ
- Contact support (chat/email/phone)
- App version
- Rate app
- Logout

**Features:**

- Profile completion progress bar
- Verification status badge
- Quick access to recent orders
- Saved addresses

---

## Mobile-Specific Features

### 1. Push Notifications

**Triggers:**

- Order status change
- Payment confirmation
- Quote expiration (24h before)
- Sourcing request update
- Delivery confirmation
- Promotional offers (opt-in)

**Customization:**

- Quiet hours (do not disturb)
- Notification groups (order updates, promotions)
- Priority notifications (urgent order issues)

### 2. Camera Integration

**Use Cases:**

- Upload product reference images (sourcing request)
- Upload payment proof (M-Pesa receipt)
- Scan QR codes (payment prompts, invoices)
- Document scanning (certificates, licenses)

### 3. Location Services

**Features:**

- Auto-detect delivery city
- Find nearby warehouses (if applicable)
- Map integration for delivery address
- Estimated delivery time based on location

### 4. Biometric Authentication

**Features:**

- Face ID (iOS)
- Touch ID (Android)
- Fingerprint (Android)
- Optional for login and checkout

### 5. Offline Mode

**Features:**

- Cache recent orders, products, invoices
- Queue actions when offline
- Sync when connection restored
- "Offline" indicator in header

### 6. Pull-to-Refresh

**Implemented on:**

- Home dashboard
- Catalog list
- Order list
- Invoice list
- Sourcing requests

### 7. Swipe Gestures

**Implemented:**

- Swipe left/right on product images (carousel)
- Swipe to remove from cart
- Swipe to archive/complete (orders)
- Swipe to reply (notifications)

---

## Design System (Mobile)

### Color Palette (Same as Web)

| Token            | Hex       | Usage                                  |
| ---------------- | --------- | -------------------------------------- |
| Brand Green      | `#1a6b50` | Primary buttons, active states, prices |
| Brand Green Dark | `#155a42` | Hover state, pressed buttons           |
| Teal Light       | `#e8f4f0` | Card backgrounds, badges               |
| Teal Border      | `#b2d8cc` | Card borders, dividers                 |
| White            | `#ffffff` | Card surfaces, backgrounds             |
| Gray Page        | `#f0faf6` | Page backgrounds                       |
| Text Primary     | `#111827` | Headings, main text                    |
| Text Secondary   | `#6b7280` | Body, labels                           |
| Amber            | `#f59e0b` | Warnings, pre-order badges             |
| Red              | `#ef4444` | Errors, destructive actions            |
| Blue             | `#2563eb` | Bank transfer badges                   |
| Green            | `#16a34a` | Success, in-stock, M-Pesa              |

### Typography

- **Font**: Inter (system font fallback on mobile)
- **Headings**: `font-bold`, sizes: 24px, 20px, 18px, 16px
- **Body**: `font-normal`, 14px, 16px
- **Labels**: `font-semibold`, 12px, uppercase
- **Prices**: `font-black`, 18px, brand green
- **Mono**: For IDs, order numbers

### Spacing (Mobile-First)

- **Screen padding**: 16px
- **Card padding**: 16px
- **Section gap**: 12px, 16px, 24px
- **Button height**: 48px (minimum touch target)
- **Input height**: 48px
- **Icon size**: 20px, 24px

### Components

**Buttons:**

```
Primary:   bg-[#1a6b50] text-white font-bold py-3 px-6 rounded-xl
Outline:   border border-[#1a6b50] text-[#1a6b50] bg-transparent py-3 px-6 rounded-xl
Danger:    bg-red-50 text-red-600 font-bold py-2 px-4 rounded-lg
Ghost:     bg-transparent text-[#1a6b50] py-2 px-4
```

**Cards:**

```
bg-white rounded-2xl border border-gray-100 shadow-sm p-4
```

**Inputs:**

```
bg-gray-50 border border-gray-200 rounded-xl py-3 px-4
focus:ring-2 focus:ring-[#1a6b50] focus:border-[#1a6b50]
```

**Badges:**

```
In Stock:   bg-green-50 text-green-700 rounded-full px-2 py-1 text-xs
Pre-Order:  bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs
Out Stock:  bg-red-50 text-red-600 rounded-full px-2 py-1 text-xs
M-Pesa:     bg-[#1a6b50] text-white rounded-md px-2 py-1 text-xs
```

**Navigation:**

```
Bottom Nav:  bg-white border-t shadow-sm
Active:      text-[#1a6b50]
Inactive:    text-gray-400
```

---

## Navigation Structure

### Bottom Navigation (5 tabs)

```
[Home] [Catalog] [Cart] [Orders] [Profile]
```

**Home**: Dashboard, quick actions, recent activity
**Catalog**: Product search, filters, list
**Cart**: Shopping cart, checkout
**Orders**: Order history, tracking
**Profile**: Account, settings, support

### Side Drawer (optional)

```
[Profile Picture]
[Name]
[Email]

Home
Catalog
Sourcing Requests
Invoices
Payment History
Saved Items
Addresses
Settings
Help & Support
Logout
```

---

## Performance Optimization

### 1. Code Splitting

- Lazy load screens
- Dynamic imports for heavy components
- Code splitting by route

### 2. Image Optimization

- Use `react-native-fast-image`
- Resize images based on display size
- WebP format where supported
- Placeholder blur effect

### 3. Data Caching

- React Query for API caching
- Local storage for user preferences
- SQLite for offline data (if needed)

### 4. Bundle Size

- Tree-shake unused dependencies
- Use native modules instead of JS alternatives
- Optimize fonts (Inter subset)

### 5. Network Optimization

- Request batching
- Pagination for lists
- Image lazy loading
- Offline queue for actions

---

## Testing Strategy

### 1. Unit Tests

- All hooks and utilities
- Component rendering
- State management

### 2. Integration Tests

- User flows (login → browse → cart → checkout)
- API integration
- Navigation

### 3. E2E Tests

- Full user journeys
- Cross-platform consistency
- Performance benchmarks

### 4. Manual Testing

- Different screen sizes (iPhone SE to Pro Max)
- Android devices (various DPIs)
- Network conditions (2G, 3G, 4G, WiFi)
- Offline scenarios

---

## Deployment

### 1. Development

- Expo Go for testing
- EAS Development Builds for native modules
- Hot reload for rapid iteration

### 2. Staging

- EAS Preview builds
- TestFlight (iOS)
- Google Play Beta (Android)

### 3. Production

- EAS Build (cloud builds)
- App Store Connect submission
- Google Play Console submission
- CI/CD with GitHub Actions

### 4. Updates

- Expo Updates for JS updates
- Store updates for native changes
- Feature flags for gradual rollouts

---

## Future Enhancements

### Phase 2

- Chat with sellers
- Video calls for product demos
- AR product visualization
- Voice search
- Multi-language support (Swahili)

### Phase 3

- Loyalty program
- Referral system
- Group buying (community sourcing)
- Supplier dashboard
- Analytics for businesses

---

## Success Metrics

### User Engagement

- Daily active users (DAU)
- Session duration
- Screens per session
- Retention rate (Day 1, Day 7, Day 30)

### Business Metrics

- Conversion rate (catalog → cart → checkout)
- Average order value
- Sourcing request completion rate
- Customer satisfaction (NPS)

### Technical Metrics

- App load time (< 2s)
- Screen load time (< 1s)
- Crash-free users (> 99%)
- API success rate (> 99%)

---

## Conclusion

This mobile app design preserves the core functionality and brand identity of the web platform while optimizing for mobile use cases. The focus is on:

1. **Speed**: Fast load times and smooth interactions
2. **Simplicity**: Clean, intuitive interface
3. **Reliability**: Offline support and robust error handling
4. **Context**: Location-aware and push notification features

The same design system, color palette, and terminology ensure brand consistency across platforms while leveraging mobile-specific capabilities for an enhanced user experience.
