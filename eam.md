# Lean SaaS Inventory MVP Spec

## Core Value

> Help small shop owners know when they are running out of stock.

---

# 1. MVP Scope

## In Scope

* Auth (Register / Login)
* Auto workspace creation
* Product management (create, edit)
* Import / Export stock
* Low stock detection
* Dashboard (summary)

## Out of Scope

* Multi-user within a workspace (each workspace has exactly one owner)
* Advanced reports or analytics
* Notifications (email / Zalo / push)
* Excel / CSV import-export
* Product deletion (soft or hard)

---

# 2. Actor

## Owner (Shop Owner)

* Manages products (create, edit threshold)
* Imports and exports stock
* Views dashboard to spot low/out-of-stock items

## Admin (Platform Operator)

* Views all registered users and their account status
* Disables or re-enables user accounts
* Views platform-level stats (total users, total products)
* Cannot read or modify any workspace's shop data

---

# 3. Data Model

## User
| Field      | Type     | Notes                                      |
|------------|----------|--------------------------------------------|
| id         | UUID     |                                            |
| email      | string   | unique                                     |
| password   | string   | hashed                                     |
| role          | enum     | OWNER \| ADMIN; default OWNER                          |
| status        | enum     | ACTIVE \| DISABLED; default ACTIVE                     |
| token_version | integer  | default 0; increment to invalidate all active tokens   |
| created_at    | datetime |                                                        |

> Admin accounts are seeded directly into the database — they are not created through the public registration flow.

## Workspace
| Field      | Type     | Notes                                                        |
|------------|----------|--------------------------------------------------------------|
| id         | UUID     |                                                              |
| owner_id   | UUID     | FK → User; one workspace per user                            |
| name       | string   | auto-set to the part of the email before `@` (e.g. `john` from `john@gmail.com`) |
| created_at | datetime |                                                              |

## Product
| Field        | Type     | Notes                                         |
|--------------|----------|-----------------------------------------------|
| id           | UUID     |                                               |
| workspace_id | UUID     | FK → Workspace; all queries filter by this    |
| name         | string   | required                                      |
| sku          | string   | optional, unique within workspace             |
| quantity     | integer  | >= 0; starts at 0                             |
| threshold    | integer  | >= 0; default 0 (means no low-stock alert)    |
| created_at   | datetime |                                               |
| updated_at   | datetime | updated on every edit or stock change         |

## Transaction
| Field        | Type     | Notes                        |
|--------------|----------|------------------------------|
| id           | UUID     |                              |
| workspace_id | UUID     | FK → Workspace               |
| product_id   | UUID     | FK → Product                 |
| type         | enum     | IMPORT \| EXPORT             |
| quantity     | integer  | > 0                          |
| note         | string   | optional                     |
| created_at   | datetime |                              |

---

# 4. Use Cases

## UC-01: Register & Start Using

**Goal:** Start using within 1 minute.

### Flow

1. User enters email and password (min 8 characters).
2. System creates User, auto-creates a Workspace, and issues a JWT.
3. Redirect to Dashboard (empty state).

**Note:** Every subsequent request is scoped to the user's workspace. The workspace is transparent to the user — they never need to manage it.

---

## UC-01b: Login

**Goal:** Return to the app.

### Flow

1. User enters email and password.
2. System validates credentials and checks `user.status`.
3. If valid and ACTIVE:
   * Issue a new JWT (expires in 7 days).
   * If `role = OWNER` → redirect to Dashboard.
   * If `role = ADMIN` → redirect to Admin Panel.
4. If invalid credentials → error: "Incorrect email or password."
5. If `status = DISABLED` → error: "Your account has been disabled. Contact support."

---

## UC-02: Create Product

**Goal:** Add a product to track.

### Flow

1. User clicks "Add product".
2. User enters:
   * Name (required)
   * SKU (optional)
   * Threshold — the quantity below which the item is considered low stock (optional, default = 0)
3. System creates Product with `quantity = 0`.

---

## UC-03: Edit Product

**Goal:** Fix a product name or adjust its low-stock threshold.

### Flow

1. User opens a product and clicks "Edit".
2. User can change: Name, SKU, Threshold.
3. System saves changes. If threshold changed, stock status is re-evaluated immediately.

**Note:** Quantity cannot be edited directly — it only changes through Import/Export transactions.

---

## UC-04: Import Stock

**Goal:** Record stock coming in.

### Flow

1. User selects a product.
2. User enters quantity (must be > 0) and an optional note.
3. System:
   * Creates an IMPORT transaction.
   * Increases `product.quantity` by the entered amount.
   * Re-evaluates stock status.

---

## UC-05: Export Stock

**Goal:** Record stock going out.

### Flow

1. User selects a product.
2. User enters quantity (must be > 0) and an optional note.
3. System validates: `export_quantity <= product.quantity`.
4. If valid:
   * Creates an EXPORT transaction.
   * Decreases `product.quantity` by the entered amount.
   * Re-evaluates stock status.

### Alternative

* If quantity is insufficient → reject with message: "Not enough stock. Current: {quantity}."

---

## UC-06: View Dashboard

**Goal:** See the full picture at a glance.

### Flow

System displays:
* Total products
* Count of LOW_STOCK items (with list)
* Count of OUT_OF_STOCK items (with list)

---

## UC-07: View Transaction History (per product)

**Goal:** Audit past imports and exports for a single product.

### Flow

1. User opens a product.
2. System shows a list of transactions ordered by `created_at DESC`:
   * Type (IMPORT / EXPORT), quantity, note, date.

---

## UC-08: View All Users (Admin)

**Goal:** Know who is using the platform.

### Flow

1. Admin opens the admin panel.
2. System displays a paginated user list:
   * Email, role, status (ACTIVE / DISABLED), registered date, product count.

---

## UC-09: Disable / Enable User Account (Admin)

**Goal:** Handle abuse or inactive accounts.

### Flow — Disable

1. Admin finds a user in the list.
2. Admin clicks "Disable" and confirms the prompt.
3. System sets `user.status = DISABLED` and increments `user.token_version`.
4. On the user's next API call, the server detects the token version mismatch and returns 401.
5. Future logins are rejected until re-enabled.

### Flow — Re-enable

1. Admin clicks "Enable" on a disabled user.
2. System sets `user.status = ACTIVE`.
3. User can log in again normally.

**Note:** Disabling a user does not delete their workspace or data.

---

## UC-10: View Platform Stats (Admin)

**Goal:** Know if the product is being used.

### Flow

System displays:
* Total registered users
* Disabled users (count)
* Total products across all workspaces
* Total transactions (all time)

---

# 5. Business Rules

**Rule 1 — Quantity is non-negative**
```
product.quantity >= 0 at all times
```

**Rule 2 — Export cannot exceed current stock**
```
export_quantity <= product.quantity
```

**Rule 3 — Low stock condition**
```
product.quantity <= product.threshold AND product.quantity > 0
Only applies when threshold > 0. If threshold = 0, item is never LOW_STOCK.
```

**Rule 4 — Out of stock**
```
product.quantity = 0
```

**Rule 5 — Workspace isolation**
```
All products and transactions belong to a workspace.
A user can only read/write data within their own workspace.
```

**Rule 6 — Default threshold**
```
If threshold is not provided, it defaults to 0.
A threshold of 0 disables the low-stock alert for that product.
```

**Rule 7 — Admin cannot access shop data**
```
Admin role has no access to any workspace's products or transactions.
Admin endpoints operate only on User-level data and aggregate stats.
```

**Rule 8 — Disabled user cannot log in**
```
If user.status = DISABLED, login is rejected regardless of correct credentials.
Error: "Your account has been disabled. Contact support."
```

**Rule 9 — Admin accounts are seeded, not registered**
```
The public POST /auth/register endpoint always creates role = OWNER.
Admin accounts must be created directly in the database by the operator.
```

**Rule 10 — Password minimum length**
```
Password must be at least 8 characters.
No complexity rules beyond length for MVP.
```

**Rule 11 — Token versioning for session invalidation**
```
User has a token_version integer (default 0).
JWT payload includes token_version at issuance.
On each API request, server compares JWT token_version to user.token_version.
If mismatch → return 401 (Unauthorized).
Disabling a user increments token_version, immediately invalidating all active tokens.
```

---

# 6. Stock Status

Stock status is **computed**, not stored. It is derived from `quantity` and `threshold` at read time.

```
OUT_OF_STOCK → quantity = 0
LOW_STOCK    → quantity <= threshold AND quantity > 0 AND threshold > 0
IN_STOCK     → quantity > threshold
```

---

# 7. Core Flows

## First-Time User Flow

```
Register → Auto-create workspace → Dashboard (empty state)
→ Add product → Import stock → Dashboard shows live data
```

## Daily Usage Flow (Owner)

```
Login → Dashboard (spot low/out-of-stock)
→ Click item → Import or Export → Quantity updates in-place
```

## Admin Flow

```
Login (role = ADMIN) → Admin Panel
→ View user list → Disable / Enable account
→ View platform stats
```

---

# 8. API

All endpoints require `Authorization: Bearer <token>` except Auth.
All product and transaction data is automatically scoped to the authenticated user's workspace.

## Auth

```
POST /auth/register    { email, password }
POST /auth/login       { email, password }
POST /auth/logout      Invalidates token (clears client-side; server is stateless)
```

## Product

```
GET    /products                    List all products (includes computed status)
                                    Query: ?page=1&limit=50
                                    Default sort: OUT_OF_STOCK first, then LOW_STOCK, then IN_STOCK; alphabetical within each group
POST   /products                    Create product
GET    /products/:id                Get single product
PUT    /products/:id                Update name, sku, threshold
```

## Inventory

```
POST   /inventory/import            { product_id, quantity, note? }
POST   /inventory/export            { product_id, quantity, note? }
GET    /inventory/transactions      List transactions for a product
                                    Query: ?product_id=:id&page=1&limit=50 (required: product_id)
```

## Dashboard

```
GET    /dashboard                   Returns: total_products, low_stock[] (all), out_of_stock[] (all)
```

## Admin
All `/admin/*` endpoints require `Authorization: Bearer <token>` with `role = ADMIN`.
Requests from OWNER role return 403.

```
GET    /admin/users                 List all users (email, role, status, created_at, product_count)
                                    Query: ?page=1&limit=50
PUT    /admin/users/:id/disable     Set user.status = DISABLED, increment token_version
PUT    /admin/users/:id/enable      Set user.status = ACTIVE
GET    /admin/stats                 Platform-wide counts
```

---

# 9. UI/UX Rules

## Design Principles

| # | Rule |
|---|------|
| 1 | **Mobile-first.** Shop owners use phones. Layouts must work on a 390px screen without horizontal scrolling. |
| 2 | **Max 2 taps to complete any core action.** Dashboard → tap item → Import/Export modal. No deeper. |
| 3 | **One primary action per screen.** Each screen has exactly one prominent button (filled, high contrast). All other actions are secondary. |
| 4 | **No decorative elements.** Every pixel earns its place. No hero images, no illustrations on functional screens. |
| 5 | **Empty states guide, not dead-end.** Every empty list shows a single clear CTA, not just "No items found." |

## Visual Standards

| Element | Rule |
|---------|------|
| Status colors | 3 values only — Red: OUT_OF_STOCK · Amber: LOW_STOCK · Green: IN_STOCK. Never invent a 4th. |
| Status badge | Always visible in the product list row. Never hidden behind a click. |
| Typography | Max 2 font sizes per screen: a heading and a body size. |
| Spacing | Generous tap targets — minimum 44px height for any interactive element. |

## Interaction Rules

| # | Rule |
|---|------|
| 1 | After import/export succeeds: modal closes, quantity and status badge update in-place. No full page reload. |
| 2 | Confirmation dialog only before destructive actions (disable user). Not before imports, exports, or edits. |
| 3 | Number inputs: `type="number"`, `min="1"`, integers only. Browser must prevent negative values and decimals. |
| 4 | Forms submit on Enter key. |
| 5 | Error messages are plain language. Never expose error codes or stack traces to the user. |
| 6 | Import/Export modal always shows current stock at the top, regardless of action type. |

---

# 10. UI Screens

## Login / Register
* Email + password fields, submit button.
* On success: OWNER → Dashboard. ADMIN → Admin Panel.
* Single toggle to switch between Login and Register views (no separate pages).

## Dashboard
* Summary cards: Total Products / Low Stock / Out of Stock.
* Two lists below: LOW_STOCK items, OUT_OF_STOCK items.
* Each item links to its product page.
* "Add product" button.

## Product List
* Table: Name, SKU, Quantity, Status badge, Threshold.
* Row actions: Edit, Import, Export.

## Product Detail
* Product info + Edit form (name, SKU, threshold).
* Transaction history list (type, qty, note, date).
* Import / Export buttons.

## Admin Panel (Admin only)
* Platform stats at the top: Total Users / Disabled / Total Products / Total Transactions.
* User table: Email, Status badge, Registered date, Product count, Actions (Disable / Enable).
* Admin panel is only accessible to users with `role = ADMIN`. Shop owners see a 403 page.

## Import / Export Modal
* Product name and **current stock** shown at top (read-only) — always, for both import and export.
* Quantity input (number, required, > 0).
* Note input (optional).
* Confirm button (primary action).
* On export: if entered quantity exceeds current stock, show inline error before allowing submit.

---

# 11. MVP Success Criteria

* User can register and reach the dashboard in under 30 seconds.
* User can create a product and import stock in under 60 seconds total.
* Export correctly rejects when quantity exceeds current stock.
* Dashboard accurately reflects live stock status after every transaction.
* Stock status (LOW / OUT) is always consistent with quantity and threshold.
