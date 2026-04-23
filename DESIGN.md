# Smart Supply Sourcing China — Design System & Page Guide

## Color Palette

| Token            | Hex                           | Usage                                         |
| ---------------- | ----------------------------- | --------------------------------------------- |
| Brand Green      | `#1a6b50`                     | Primary buttons, active states, prices, links |
| Brand Green Dark | `#155a42`                     | Hover state for brand green                   |
| Teal Light       | `#e8f4f0`                     | Card backgrounds, hover fills, badges         |
| Teal Mid         | `#f0faf6`                     | Page backgrounds                              |
| Teal Border      | `#b2d8cc`                     | Card borders, dividers                        |
| Teal Muted       | `#a8d5c4`                     | Sidebar text on dark backgrounds              |
| Dark Sidebar     | `#1a6b50`                     | Right sidebar on sourcing/cart pages          |
| White            | `#ffffff`                     | Card surfaces                                 |
| Gray Page        | `#f0faf6`                     | All buyer page backgrounds                    |
| Gray Border      | `#e5e7eb` / `border-gray-100` | Card borders                                  |
| Text Primary     | `#111827` / `text-gray-900`   | Headings                                      |
| Text Secondary   | `#6b7280` / `text-gray-500`   | Body, labels                                  |
| Text Muted       | `#9ca3af` / `text-gray-400`   | Placeholders, hints                           |
| Amber            | `#f59e0b`                     | Pre-order badges, warnings                    |
| Red              | `#ef4444`                     | Errors, out-of-stock, destructive             |
| Blue             | `#2563eb`                     | Bank transfer badges                          |
| Green            | `#16a34a`                     | In-stock, M-Pesa, success                     |

---

## Typography

- **Font:** Inter (all weights)
- **Page titles:** `text-2xl font-black` or `text-3xl font-black`
- **Section headings:** `text-base font-bold`
- **Labels:** `text-xs font-bold uppercase tracking-wide text-gray-500`
- **Body:** `text-sm text-gray-600`
- **Prices:** `font-black text-[#1a6b50]`
- **Mono (IDs, refs):** `font-mono`

---

## Spacing & Layout

- **Page wrapper:** `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- **Page background:** `bg-[#f0faf6] min-h-screen`
- **Card:** `bg-white rounded-2xl border border-gray-100 shadow-sm p-6`
- **Section gap:** `space-y-5` or `gap-6`
- **Grid (2-col):** `grid grid-cols-1 lg:grid-cols-2 gap-10`
- **Grid (3-col):** `grid grid-cols-1 lg:grid-cols-3 gap-6`

---

## Components

### Buttons

```
Primary:   bg-[#1a6b50] hover:bg-[#155a42] text-white font-bold px-6 py-3 rounded-xl
Outline:   border border-[#1a6b50] text-[#1a6b50] hover:bg-[#e8f4f0] font-bold px-6 py-3 rounded-xl
Danger:    border border-red-200 text-red-500 hover:bg-red-50
```

### Badges

```
In Stock:   bg-green-50 text-green-700 border border-green-200 rounded-full
Pre-Order:  bg-amber-50 text-amber-700 border border-amber-200 rounded-full
Out Stock:  bg-red-50 text-red-600 border border-red-200 rounded-full
M-Pesa:     bg-green-600 text-white rounded-md (on product images)
```

### Cards

```
Standard:  bg-white rounded-2xl border border-gray-100 shadow-sm
Teal:      bg-[#e8f4f0] border border-[#b2d8cc] rounded-2xl
Dark:      bg-[#1a6b50] rounded-2xl text-white (sidebar/summary)
```

### Inputs

```
bg-gray-50 border border-gray-200 rounded-lg focus:ring-[#1a6b50] focus:border-[#1a6b50]
```

### Pro Tip Banner

```
bg-[#e8f4f0] border border-[#b2d8cc] rounded-xl px-4 py-3
💡 icon + text-xs text-[#1a6b50]
```

---

## Pages

---

### Landing Page (`/`)

**Background:** `bg-white`

**Sections (top to bottom):**

1. **Hero** — `bg-[#e8f4f0]` two-column: headline + CTAs left, warehouse image right. Stats row below CTAs.
2. **Trust Bar** — `bg-white border-y` four feature pills (B2B Sourcing, Pro-forma, Logistics, Verified Vendors)
3. **How It Works** — `bg-white` four step cards on `bg-gray-50`
4. **Recent Quotes** _(authenticated only)_ — `bg-[#e8f4f0]` quote cards with expiry badges
5. **Featured Inventory** — `bg-[#f0faf6]` product grid (3 cols), links to `/product/[id]`
6. **Payment Section** — `bg-white` M-Pesa + Bank cards left, orange security card right
7. **CTA Banner** — `bg-[#1e3a5f]` dark navy, white text
8. **Footer** — `bg-white border-t` four-column links

**Key elements:**

- Brand name: `SMART SUPPLY SOURCING CHINA` in `text-[#2a7a5e] font-bold`
- Primary CTA: "Start Sourcing →" → `/sourcing/request`
- Secondary CTA: "Browse Catalog" → `/catalog`

---

### Catalog Page (`/catalog`)

**Background:** `bg-[#f0faf6]`
**Layout:** Left sidebar (filters) + main content

**Header bar** (`bg-white border-b`):

- Breadcrumb
- Title: "China Direct Inventory" + result count
- Filter pills: M-Pesa Ready, Bank Eligible
- Search input
- Grid/List toggle (teal active state)
- "Custom Sourcing →" link

**Left Sidebar** (`bg-white border-r`):

- Sections: Category, Availability, Lead Time, Price Range
- Teal checkboxes (`text-[#1a6b50]`)
- Bottom: info text + "Request Full Price List" teal outline button

**Product Grid:**

- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Each card: image (clickable → product detail), category label, availability badge, price in teal, Add to Cart + Request Quote buttons

**Bottom CTA Banner:**

- `bg-[#1a6b50] rounded-2xl` — "Direct Factory Access. Secure Local Payment."
- "Request Sourcing →" white button

---

### Product Detail Page (`/product/[id]`)

**Background:** `bg-[#f0faf6]`
**Layout:** Two-column (image left, details right) + tabbed section below + related products

**Left column:**

- Main image `rounded-2xl` with availability badge overlay
- Thumbnail strip (5 max)

**Right column:**

- SKU + status indicator
- Product name `font-black`
- Star rating (5 stars amber)
- Price `font-black text-gray-900` + `/Unit` label
- Payment option pills (Instant Clearance teal, 1-3 Days Transfer blue)
- Quantity selector + "Add to Cart" teal button + "Request Custom Quote" outline
- Pre-order: teal dark box with deposit amount + action buttons
- Trust icons: Trade Assurance, Tracked Freight, Secure Escrow
- Secure escrow footer line

**Tabbed section** (`bg-white rounded-2xl`):

- Tabs: Product Details / Specifications / Shipping & Delivery / Vendor Info
- Active tab: `border-[#1a6b50] text-[#1a6b50]`

**Related Products:**

- 4-col grid, each card links to `/product/[id]`
- Teal price, category label, M-Pesa badge

---

### Sourcing Request Page (`/sourcing/request`)

**Background:** `bg-[#f0faf6]`
**Layout:** Two-column (form left 2/3, sidebar right 1/3)

**Top:**

- Breadcrumb: "Sourcing Service ›"
- Title: "Sourcing Form" `font-black`
- Step indicator: Step 1: Request › Step 2: Quotation › Step 3: Fulfilment

**Form sections** (white `rounded-2xl` cards):

1. **Item Specifications** — Product name, quantity, target price, technical specs textarea
2. **Reference Media** — File uploader (drag & drop, teal border on hover)
3. **Logistics & Delivery** — Air/Sea freight toggle (teal active), destination city, Incoterms checkboxes
4. **Compliance & Quality** — 6 certification checkboxes in 3-col grid
5. **Contact & Business Info** — 4 fields in 2-col grid
6. **Pro Tip Banner** — teal `bg-[#e8f4f0]`

**Right sidebar** (`bg-[#1a6b50] rounded-2xl`):

- Request Summary (teal dark)
- Payment Pathway: M-Pesa / Bank Transfer selectable cards
- "Submit Sourcing Request →" white button
- Secure escrow footer
- "Need help?" white card below with phone number

---

### Shopping Cart (`/cart`)

**Background:** `bg-[#f0faf6]`
**Layout:** Two-column (items left 2/3, summary right 1/3)

**Cart items** (white `rounded-2xl` cards):

- Product icon placeholder, name, unit price, quantity controls, teal subtotal
- Trash icon (red on hover)
- Trust badges row: Verified Suppliers, Tracked Delivery, Secure Escrow

**Order Summary sidebar** (white `rounded-2xl`):

- Subtotal, Sourcing Fee (Included), Shipping (at checkout)
- Pre-order deposit warning (amber) if applicable
- M-Pesa / Bank payment option pills
- "Proceed to Checkout →" teal button
- "Continue Shopping" outline button
- Secure escrow footer
- Pro tip banner below

**Empty state:**

- Teal icon, "Your cart is empty", "Browse Catalog →" teal button

---

### Buyer Dashboard (`/dashboard`)

**Background:** `bg-[#f0faf6]`
**Layout:** Left sidebar + main content

**Sidebar** (`bg-white border-r`):

- Logo + "Smart Supply" brand
- User greeting strip (`bg-[#f0faf6]`) showing first name
- Nav: Overview, My Orders, Invoices (teal active state)
- Logout (red hover)

**Overview tab:**

- 4 KPI cards (Outstanding Balance, Pending Reconciliation, Total Orders, Completed Orders)
- 3 quick-action cards: New Sourcing Request, Browse Catalog, Payment History

**My Orders tab:**

- Info banner explaining orders vs sourcing requests
- Empty state with two CTAs (Submit Sourcing Request, Browse Catalog)

**Invoices tab:**

- 3 KPI cards: Outstanding Balance (teal bg), Pending Reconciliation, Total Paid MTD
- Payment history table with search + filter
- Teal pagination

---

### Login Page (`/login`)

**Background:** `bg-gray-50`
**Card:** `bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md`

- Logo + "SMART SUPPLY SOURCING CHINA"
- Email + Password fields
- "Sign In" button (currently blue — can update to teal)
- "Don't have an account? Sign up" link
- **On success:** redirects to `/` (landing page)

---

### Register Page (`/register`)

**Background:** `bg-gray-50`
**Card:** same as login

- Fields: Full name, Email, Phone (required, WhatsApp preferred), Company name, Password
- "Create Account" button
- **On success:** redirects to `/` (landing page)

---

## Admin Pages

### Admin Layout

**Sidebar:** `bg-slate-800` dark, white text

- Nav: Dashboard, Orders, Quotes & Ledger, Catalog, Inventory, Media, Sourcing

---

### Admin Catalog (`/admin/catalog`)

**Tabs:** Products | Categories

**Products tab:**

- "Add Product" teal button
- Product form: name, category (dynamic from DB), availability, price, stock, description, featured toggle, image upload
- Product grid: 4-col, image carousel, edit/delete per card

**Categories tab:**

- Add input + "Add" teal button
- List of categories with slug shown in mono
- Inline rename (pencil icon → input → check/X)
- Delete with confirmation (reassigns products to "uncategorised")

---

### Admin Sourcing Detail (`/admin/sourcing/[id]`)

**Layout:** Two-column (main left 2/3, sidebar right 1/3)

**Left:**

- Breadcrumb + page header with status badge
- Workflow status timeline (4 steps)
- Requester Information card
- Requested Items card (with specifications)
- **Reference Media & Attachments** — always visible, shows "No files" state or image grid with view/download buttons
- Admin Internal Notes textarea

**Right sidebar:**

- Request Summary (dark `bg-gray-900`)
- Actions: Mark Under Review, Generate Pro-Forma, Request More Info, Reject

---

### Admin Ledger (`/admin/ledger`)

**4 KPI cards:** Unmatched Transfers, Pending Verification, Cleared Today, Rejected Proofs — all driven by real DB data
**Tabs:** Payments Ledger | Active Quotes
**Health Score:** SVG donut chart, percentage calculated from real reconciliation data
