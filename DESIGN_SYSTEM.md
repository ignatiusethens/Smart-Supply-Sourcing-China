# Smart Supply Sourcing — Design System

## Colors

### Primary (Industrial Blue-Gray)

| Token         | Value     | Usage                        |
| ------------- | --------- | ---------------------------- |
| `primary-50`  | `#f8fafc` | Page backgrounds             |
| `primary-100` | `#f1f5f9` | Section backgrounds          |
| `primary-200` | `#e2e8f0` | Borders (light)              |
| `primary-300` | `#cbd5e1` | Borders                      |
| `primary-400` | `#94a3b8` | Muted text                   |
| `primary-500` | `#64748b` | Secondary text               |
| `primary-600` | `#475569` | Primary text                 |
| `primary-700` | `#334155` | Emphasis text                |
| `primary-800` | `#1e293b` | Strong text                  |
| `primary-900` | `#0f172a` | Hero backgrounds, dark cards |

### Accent (Industrial Orange)

| Token        | Value     | Usage                |
| ------------ | --------- | -------------------- |
| `accent-500` | `#f97316` | Interactive elements |
| `accent-600` | `#ea580c` | Primary buttons      |
| `accent-700` | `#c2410c` | Button hover         |

### Status Colors

| Token       | Usage                                            |
| ----------- | ------------------------------------------------ |
| `success-*` | In-stock badges, paid status, positive actions   |
| `warning-*` | Pre-order badges, pending status, caution states |
| `error-*`   | Out-of-stock, rejected, destructive actions      |
| `info-*`    | Bank transfer, informational, primary CTAs       |

## Typography

**Font:** Inter (loaded via `next/font/google`, weights 400/500/600/700/800)

```css
--font-primary:
  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

## Spacing

Base unit: **4px (0.25rem)**. Use Tailwind's standard scale (`p-4` = 16px, `p-6` = 24px, etc.).

Touch targets: minimum **44px** on mobile (enforced via `globals.css`).

## Components

### Button

- `default` → orange (`bg-accent-600`) — primary actions
- `outline` → bordered (`border-primary-300`) — secondary actions
- `ghost` → transparent (`hover:bg-primary-100`) — nav/icon buttons
- `destructive` → red (`bg-error-600`) — delete/reject

### Badge

- `success` — In Stock, Paid
- `warning` — Pre-Order, Pending
- `error` / `destructive` — Out of Stock, Rejected
- `info` — Bank Transfer, Informational
- `mpesa` — M-PESA INSTANT (green)
- `bank` — BANK 1-3 DAYS (blue)

### Card

- Default: `border-primary-200 shadow-sm hover:shadow-md hover:-translate-y-px`
- Elevated: `shadow-lg`

### Input

- Base: `border-primary-300 focus:ring-accent-500`
- Error: `border-error-500 focus:ring-error-500`
- Success: `border-success-500 focus:ring-success-500`

## Responsive Breakpoints

| Name      | Width      | Usage                       |
| --------- | ---------- | --------------------------- |
| Mobile    | `< 768px`  | Default (mobile-first)      |
| `md`      | `≥ 768px`  | Tablet                      |
| `lg`      | `≥ 1024px` | Desktop                     |
| `desktop` | `≥ 1920px` | Large desktop (4-col grids) |

## Accessibility

- Focus ring: `focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2`
- All interactive elements have ARIA labels
- Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables animations
- Touch targets: min 44×44px on mobile

## Admin Layout

Admin pages use `AdminLayout` (`src/components/layout/AdminLayout.tsx`) which provides:

- Dark sidebar (`bg-slate-800`) with Dashboard, Orders, Quotes & Ledger, Inventory nav
- Active state: `bg-blue-600 text-white`
- Logout button at bottom

## Buyer Layout

Buyer pages use `BuyerLayout` (`src/components/layout/BuyerLayout.tsx`) which provides:

- White header with blue branding, search bar, cart/bell/avatar icons
- Dark footer (`bg-primary-900`) with 4-column links
