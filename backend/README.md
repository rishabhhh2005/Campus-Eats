# Campus Eats — Backend

A **Node.js + Express + MongoDB** REST API powering the Campus Eats food ordering platform. This document explains every file, every design decision, and every API endpoint — so you can debug, extend, and explain it confidently.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Directory Structure](#directory-structure)
3. [How a Request Flows](#how-a-request-flows)
4. [Entry Point — `server.js`](#entry-point--serverjs)
5. [Database — `db/connectDB.js`](#database--dbconnectdbjs)
6. [Config — `config/razorpay.js`](#config--configrazorpayjs)
7. [Middleware — `middleware/authMiddleware.js`](#middleware--middlewareauthmiddlewarejs)
8. [Models](#models)
9. [Routes](#routes)
10. [Controllers](#controllers)
11. [Utils — `utils/helpers.js`](#utils--utilshelpersjs)
12. [Environment Variables](#environment-variables)
13. [Full API Reference](#full-api-reference)
14. [Key Design Decisions](#key-design-decisions)
15. [Common Debug Scenarios](#common-debug-scenarios)

---

## Tech Stack

| Tool | Role | Why |
|---|---|---|
| **Node.js** | Runtime | Non-blocking I/O — handles many concurrent food orders efficiently |
| **Express.js** | HTTP framework | Minimal, fast, industry-standard for REST APIs |
| **MongoDB** | Database | Schema-flexible — menu items, orders, and user profiles have evolving shapes |
| **Mongoose** | ODM (Object-Document Mapper) | Adds schemas, validation, and query helpers on top of MongoDB |
| **bcryptjs** | Password hashing | One-way hashing — raw passwords are never stored |
| **jsonwebtoken** | Auth tokens | Stateless JWT auth — no session storage needed on the server |
| **Razorpay** | Payment gateway | Handles real INR payments; has a test mode for development |
| **dotenv** | Environment config | Keeps secrets out of source code |
| **cors** | Cross-origin policy | Allows the React frontend (different port) to call this API |
| **nodemon** | Dev auto-restart | Watches files and restarts server on change — dev only |

---

## Directory Structure

```
backend/
├── server.js              ← Entry point. Boots Express, wires routes.
├── package.json           ← Dependencies and npm scripts
├── .env                   ← Secret keys (never commit this)
├── .env.example           ← Template showing which env vars are needed
│
├── config/
│   └── razorpay.js        ← Razorpay client instance (created once, reused)
│
├── db/
│   └── connectDB.js       ← Connects to MongoDB. Exits process if it fails.
│
├── middleware/
│   └── authMiddleware.js  ← JWT verification. Protects private routes.
│
├── models/
│   ├── user.js            ← User schema (auth + wallet + loyalty)
│   ├── orders.js          ← Order schema (items, status, pickup code)
│   ├── transactions.js    ← UMoney wallet credit/debit history
│   └── feedback.js        ← User feedback and website reviews
│
├── routes/
│   ├── authRoutes.js      ← /api/auth/*
│   ├── campusRoutes.js    ← /api/campuses/*
│   ├── orderRoutes.js     ← /api/orders/*
│   ├── loyaltyRoutes.js   ← /api/loyalty/*
│   ├── walletRoutes.js    ← /api/wallet/*
│   ├── paymentRoutes.js   ← /api/payment/*
│   └── feedbackRoutes.js  ← /api/feedback/*
│
├── controllers/
│   ├── authController.js
│   ├── campusController.js
│   ├── orderController.js
│   ├── loyaltyController.js
│   ├── walletController.js
│   ├── paymentController.js
│   └── feedbackController.js
│
└── utils/
    └── helpers.js         ← generatePickupCode()
```

---

## How a Request Flows

```
Browser / Frontend
      │
      ▼
  server.js              ← Receives HTTP request
      │
      ▼
  cors + express.json()  ← Parses JSON body, allows cross-origin calls
      │
      ▼
  Route file             ← Matches URL + HTTP method to a handler
      │
      ▼
  authMiddleware (if protected route)  ← Validates JWT token
      │
      ▼
  Controller function    ← Business logic: reads DB, writes DB, returns JSON
      │
      ▼
  Mongoose Model         ← Talks to MongoDB
      │
      ▼
  JSON Response          ← Sent back to the frontend
```

---

## Entry Point — `server.js`

**What:** The file Node.js runs first. It creates the Express app, registers middleware, mounts all route groups, and starts listening for connections.

**Why each line matters:**

```js
app.use(cors())
```
Without this, the browser blocks requests from `localhost:5173` (frontend) to `localhost:5000` (backend) because they are on different ports — a same-origin policy violation. CORS middleware adds the required response headers.

```js
app.use(express.json())
```
Express doesn't parse JSON request bodies by default. This middleware reads the raw request body and converts it to `req.body` as a JavaScript object.

```js
connectDB()
```
Establishes the MongoDB connection before any requests are handled. If this fails, the process exits — there's no point running an API with no database.

```js
app.use('/api/auth',     authRoutes)
app.use('/api/campuses', campusRoutes)
// ... etc
```
Each route group is mounted under its own prefix. This means inside `authRoutes.js`, routes are written as `/signup`, `/login` — not `/api/auth/signup`. This separation keeps route files clean and makes it easy to version the API later (e.g., `/api/v2/auth`).

```js
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
```
Catches any request that didn't match any route above. Without this, Express sends an HTML error page — this ensures all errors from this API are JSON.

```js
app.use((err, _req, res, _next) => { ... })
```
Express's 4-argument signature is the global error handler. If any middleware calls `next(err)`, it lands here. This is the safety net.

---

## Database — `db/connectDB.js`

**What:** A function that calls `mongoose.connect()` with the MongoDB URI from env vars.

**Why `process.exit(1)` on failure:** If the database connection fails at startup, the server is useless — it can't read or write anything. Exiting immediately is better than silently serving broken responses. The `1` signals an error exit code to the OS (useful in deployment pipelines).

**Why it's in a separate file:** `server.js` stays clean. If you ever want to connect to a test database in tests, you import this function and call it with a different URI.

---

## Config — `config/razorpay.js`

**What:** Creates a single Razorpay SDK client instance using your API keys from env vars.

**Why a separate config file:** The Razorpay client is created once and reused across all payment controller calls. If it were created inside the controller, a new instance would be made on every request — wasteful. Centralising it also means you only change key configuration in one place.

---

## Middleware — `middleware/authMiddleware.js`

**What:** The `protect` function. It reads the `Authorization` header, strips the `Bearer ` prefix, verifies the JWT signature, and attaches the decoded payload to `req.user`.

**Why JWT over sessions:** Sessions require server-side storage (Redis, DB) to track logged-in users. JWTs are self-contained — the token itself encodes the user ID and expiry. The server just verifies the signature using the secret key. This scales to multiple server instances without shared session storage.

**What `req.user` contains after verification:**
```json
{ "userId": "64abc...", "email": "user@example.com", "iat": 1714000000, "exp": 1714604800 }
```

**Why controllers use `req.user.userId` instead of accepting userId from the request body:** A malicious user could send someone else's userId in the body and access their data. `req.user.userId` comes from the server-verified token — it cannot be forged.

---

## Models

Models define the **shape of data** stored in MongoDB. Mongoose enforces types, required fields, and constraints before any data hits the database.

### `models/user.js`

The central document for a user. Stores everything attached to a person.

| Field | Type | Purpose |
|---|---|---|
| `email` | String, unique | Login identifier. `lowercase: true` normalises `User@X.com` and `user@x.com` as the same. |
| `password` | String | Stored as a bcrypt hash — never the raw password |
| `name` | String | Display name in the UI |
| `phone` | String | Optional contact number |
| `loyaltyStamps` | Number | Stamp card counter. Every completed order adds 1. Resets at 10. |
| `rewardPoints` | Number | Earned at 1 point per ₹10 spent. Redeemable at checkout. |
| `uMoneyBalance` | Number | Campus wallet balance in INR. Topped up via Razorpay. |

**Why store loyalty + wallet on the User document?** These values are read on almost every page load (header shows balance). Keeping them on the user avoids a separate DB lookup.

### `models/orders.js`

Represents a single placed order.

| Field | Purpose |
|---|---|
| `id` | Custom string ID (`Date.now()`). Used in URLs because MongoDB `_id` is long and ugly in QR codes. |
| `userId` | Reference to the User who placed the order |
| `items` | Array of sub-documents (id, name, price, qty, image) |
| `total` | Cart total before discount |
| `discount` | Discount applied (reward redemption, offers) |
| `payable` | Final amount charged = total − discount |
| `outlet` | Canteen/stall name |
| `campus` | Which campus this order belongs to |
| `status` | Enum: `Pending → Accepted → Preparing → Ready → Picked` |
| `paid` | Boolean — flipped to `true` after Razorpay verification |
| `pickupCode` | 6-character alphanumeric code. Vendor scans this to mark pickup. |
| `hiddenForVendor` | Boolean — if true, order is hidden from vendor dashboard (used for "Clear" functionality) |

**Why a custom `id` field alongside MongoDB's `_id`?** The pickup QR code encodes this `id`. Short, human-readable codes are easier for canteen staff to type if the scanner fails.

### `models/transactions.js`

An immutable ledger of every credit and debit to a user's UMoney wallet. Never update these records — only create new ones.

| Field | Purpose |
|---|---|
| `userId` | Which user's wallet |
| `type` | `credit` (top-up) or `debit` (payment) |
| `amount` | INR value |
| `description` | Human-readable reason (e.g., "Wallet top-up via Razorpay") |

### `models/feedback.js`

Stores user feedback and ratings for the platform and services.

| Field | Purpose |
|---|---|
| `userId` | Which user submitted the feedback |
| `userName` | Cached name for display |
| `rating` | 1–5 star score |
| `comment` | The actual feedback text |
| `timestamp` | When it was submitted |

---

## Routes

Route files have **one job**: map HTTP methods + URL paths to controller functions. They contain no business logic.

### `routes/authRoutes.js` → mounted at `/api/auth`

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/signup` | No | `signup` |
| POST | `/login` | No | `login` |
| GET | `/me` | ✅ Yes | `getMe` |

### `routes/campusRoutes.js` → mounted at `/api/campuses`

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/` | No | `getCampuses` |

### `routes/orderRoutes.js` → mounted at `/api/orders`

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/` | ✅ Yes | `getUserOrders` |
| POST | `/` | ✅ Yes | `createOrder` |
| DELETE | `/:id` | ✅ Yes | `deleteOrder` |
| PATCH | `/:id/status` | No (vendor) | `updateOrderStatus` |
| GET | `/:id/pickup-code` | No (vendor) | `getPickupCode` |
| GET | `/all` | No (vendor) | `getAllOrders` |
| POST | `/pickup/verify` | No (vendor) | `pickupByCode` |
| POST | `/accept/verify` | No (vendor) | `acceptByCode` |
| DELETE | `/:id/hide` | No (vendor) | `hideOrderForVendor` |

**Why some order routes have no auth?** These are vendor-side operations — canteen staff scan a QR or enter a code on a shared tablet. There's no user login on the vendor tablet. A future improvement would add a separate vendor auth role.

### `routes/loyaltyRoutes.js` → mounted at `/api/loyalty`

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/status` | ✅ Yes | `getLoyaltyStatus` |
| GET | `/rewards/balance` | ✅ Yes | `getRewardBalance` |
| POST | `/rewards/redeem` | ✅ Yes | `redeemRewards` |

### `routes/walletRoutes.js` → mounted at `/api/wallet`

| Method | Path | Auth | Handler |
|---|---|---|---|
| GET | `/balance` | ✅ Yes | `getBalance` |
| GET | `/transactions` | ✅ Yes | `getTransactions` |

### `routes/paymentRoutes.js` → mounted at `/api/payment`

| Method | Path | Auth | Handler |
|---|---|---|---|
| POST | `/create-order` | ✅ Yes | `createRazorpayOrder` |
| POST | `/verify` | ✅ Yes | `verifyPayment` |

---

## Controllers

Controllers contain the actual **business logic**. Each function: validates input → queries/mutates DB → returns a JSON response.

### `controllers/authController.js`

**`signup`**
1. Validates that email, password, name are present
2. Checks if email is already registered (`409 Conflict` if so)
3. Hashes the password with bcrypt (10 salt rounds — strong enough, not too slow)
4. Creates the user in MongoDB
5. Signs a JWT valid for 7 days
6. Returns token + safe user object (no password field)

**`login`**
1. Validates email + password are present
2. Looks up user by email
3. Uses `bcrypt.compare()` to check the hash — never decrypts
4. Returns same token + user shape as signup

> **Why the same error message for "user not found" and "wrong password"?** Saying "email not found" tells an attacker which emails are registered. Saying "Invalid credentials" for both reveals nothing.

**`getMe`**
- Protected route. `req.user.userId` is already verified by `authMiddleware`.
- Fetches the full user document with `.select('-password')` — the `-` prefix excludes that field.
- Returns the current user's profile. Used by the frontend to restore session after page refresh.

**`formatUser` helper**
- A small function that returns `{ id, email, name, phone }`.
- Used in both `signup` and `login` to avoid repeating the same object shape twice.

---

### `controllers/campusController.js`

Returns a hardcoded list of campuses. **Why hardcoded?** Campuses are static configuration — they don't change at runtime. Storing them in MongoDB would add an unnecessary collection and a DB call on every page load. For a small number of campuses, a constant in code is simpler and faster.

---

### `controllers/orderController.js`

**`getAllOrders`** — Fetches all valid orders (has items, payable > 0). Used by the vendor dashboard to see all incoming orders. `.lean()` returns plain JS objects instead of Mongoose documents — faster when you're only reading.

**`getUserOrders`** — Same query but filtered to `req.user.userId`. Sorted newest-first. This is the "My Orders" page data.

**`createOrder`**
1. Verifies the user exists
2. Creates the order with a timestamp, a generated pickup code, and reward logic
3. **Reward points:** `Math.floor(payable / 10)` — 1 point per ₹10. Added to user document in the same request.
4. Returns the created order (`201 Created`)

**`deleteOrder`** — Finds by custom `id` field (not MongoDB `_id`). Checks that `order.userId` matches the logged-in user before deleting — prevents one user from cancelling another's order.

**`updateOrderStatus`**
- Validates the new status is one of the 5 allowed values (defined as `ALLOWED_STATUSES` constant at the top — defined once, used in multiple places).
- **Loyalty stamp logic:** When an order transitions to `Picked` for the first time, the user earns 1 stamp. `% 10` resets the counter after 10 stamps automatically.

**`getPickupCode`** — Returns the pickup code for an order. Generates one if it wasn't set (shouldn't happen, but defensive coding).

**`pickupByCode`** — Vendor scans QR → sends the code → this finds the order and marks it `Picked`.

**`acceptByCode`** — Vendor accepts an order by code. Only advances status to `Accepted` if it's currently earlier in the progression (prevents going backwards).

---

### `controllers/loyaltyController.js`

All three functions use `req.user.userId` — the ID extracted from the JWT. This is the security-correct approach. If userId came from the URL (e.g., `/loyalty/status/64abc`), any logged-in user could query any other user's loyalty data just by changing the ID.

**`getLoyaltyStatus`** — Returns `loyaltyStamps` count. Frontend shows a stamp card (e.g., 7/10 stamps).

**`getRewardBalance`** — Returns `rewardPoints`. Frontend shows this at checkout so user knows how much they can redeem.

**`redeemRewards`** — Deducts points. Validates that `points` is a positive number and that the user actually has enough before deducting.

---

### `controllers/walletController.js`

**`getBalance`** — Returns `uMoneyBalance`. The frontend header shows this so users know their wallet balance.

**`getTransactions`** — Returns the last 20 transactions sorted newest-first. `.lean()` for performance (read-only). Limited to 20 to avoid sending massive payloads — pagination could be added later.

---

### `controllers/paymentController.js`

This is the most complex controller because it handles real money.

**`createRazorpayOrder`**
1. Validates amount > 0
2. Converts rupees to paise (Razorpay works in the smallest currency unit — `₹100 = 10000 paise`)
3. Calls `razorpay.orders.create()` — this registers the payment intent with Razorpay's servers
4. Returns the Razorpay `order` object AND your `RAZORPAY_KEY_ID` to the frontend. The frontend uses both to open the Razorpay payment popup.

**`verifyPayment`** — Called after the user completes payment in the Razorpay popup.
1. **Guards against missing fields** — crashes were possible if `razorpay_order_id` was undefined and `.startsWith()` was called on it
2. **Signature verification:** Razorpay signs the payment with your secret key. You recreate the HMAC-SHA256 hash and compare. If they match, the payment is genuine and wasn't tampered with.
3. **Test mode bypass:** Orders starting with `order_test_` skip signature verification — useful during development.
4. **Purpose branching:**
   - `purpose === 'umoney'` → top up the user's wallet, record a `credit` transaction
   - `purpose === 'order'` → mark the order as `paid: true`, record a `debit` transaction

---

## Utils — `utils/helpers.js`

**`generatePickupCode()`** — Generates a random 6-character code from a safe character set. Characters like `0`, `O`, `1`, `I` are excluded because they look identical on printed receipts and can cause confusion for canteen staff.

---

## Environment Variables

Stored in `.env` (never committed to Git). See `.env.example` for the template.

| Variable | Used By | Purpose |
|---|---|---|
| `MONGO_URI` | `db/connectDB.js` | MongoDB Atlas connection string |
| `JWT_SECRET` | `authMiddleware.js`, `authController.js` | Signs and verifies JWT tokens. Must be long and random. |
| `RAZORPAY_KEY_ID` | `config/razorpay.js`, `paymentController.js` | Public key sent to frontend to open payment popup |
| `RAZORPAY_KEY_SECRET` | `config/razorpay.js`, `paymentController.js` | Secret key used to verify payment signatures. Never sent to frontend. |
| `PORT` | `server.js` | Port the server listens on (defaults to 5000) |

---

## Full API Reference

### Auth — `/api/auth`
```
POST   /api/auth/signup          Body: { email, password, name, phone }
POST   /api/auth/login           Body: { email, password }
GET    /api/auth/me              Header: Authorization: Bearer <token>
```

### Campuses — `/api/campuses`
```
GET    /api/campuses
```

### Orders — `/api/orders`
```
GET    /api/orders               Header: Bearer token  → user's orders
POST   /api/orders               Header: Bearer token  → place order
DELETE /api/orders/:id           Header: Bearer token  → cancel order
PATCH  /api/orders/:id/status    Body: { status }      → vendor: update status
GET    /api/orders/:id/pickup-code                     → vendor: get QR code data
GET    /api/orders/all                                 → vendor: all orders
POST   /api/orders/pickup/verify Body: { code }        → vendor: mark picked up
POST   /api/orders/accept/verify Body: { code }        → vendor: accept order
```

### Loyalty — `/api/loyalty`
```
GET    /api/loyalty/status           Header: Bearer token → { stamps: 7 }
GET    /api/loyalty/rewards/balance  Header: Bearer token → { points: 120 }
POST   /api/loyalty/rewards/redeem   Header: Bearer token, Body: { points: 50 }
```

### Wallet — `/api/wallet`
```
GET    /api/wallet/balance           Header: Bearer token → { balance: 250 }
GET    /api/wallet/transactions      Header: Bearer token → { transactions: [...] }
```

### Payment — `/api/payment`
```
POST   /api/payment/create-order     Header: Bearer token, Body: { amount, currency?, receipt? }
POST   /api/payment/verify           Header: Bearer token, Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, purpose, orderId?, amount }
```

### Feedback — `/api/feedback`
```
POST   /api/feedback                 Header: Bearer token, Body: { rating, comment }
```

---

## Key Design Decisions

**1. JWT over Sessions**
Stateless auth — no server-side session store needed. The token contains the userId and expiry, signed with a secret. Scales horizontally (multiple server instances) without shared state.

**2. userId from Token, not URL**
Loyalty, wallet, and order endpoints derive userId from `req.user.userId` (the verified JWT payload), not from a URL parameter. This prevents IDOR (Insecure Direct Object Reference) — a common vulnerability where users access other users' data by changing the ID in the URL.

**3. Single User Document for Balance + Points**
UMoney balance, reward points, and loyalty stamps live directly on the User document. This is a deliberate denormalisation — these values are read frequently (every page load) and written rarely. Avoiding a join/lookup on every read is a performance win.

**4. Custom `id` Field on Orders**
Orders have both MongoDB's `_id` and a custom `id` field (`Date.now().toString()`). The custom `id` is what goes in URLs and QR codes — it's shorter and more readable than a 24-char hex ObjectId.

**5. ALLOWED_STATUSES Constant**
Defined once at the top of `orderController.js` and reused in both `updateOrderStatus` and `acceptByCode`. If you ever add a new status (e.g., `Cancelled`), you change it in one place.

**6. Razorpay Test Mode**
Orders with `id` starting with `order_test_` skip signature verification. This lets you test the payment flow in development without real Razorpay credentials, while production traffic still goes through full verification.

---

## Common Debug Scenarios

**Server crashes on startup**
→ Check `MONGO_URI` in `.env`. Run `node server.js` and look for "MongoDB connection error".

**401 on a protected route**
→ The `Authorization` header is missing or the token has expired (7-day expiry). Check the header format: `Authorization: Bearer <token>`.

**Payment verification fails**
→ Check that `RAZORPAY_KEY_SECRET` in `.env` matches your Razorpay dashboard. In test mode, use order IDs starting with `order_test_`.

**Order status not updating**
→ Check that the `status` value in the PATCH body is exactly one of: `Pending`, `Accepted`, `Preparing`, `Ready`, `Picked` (case-sensitive).

**Wallet balance not updating after payment**
→ The `/api/payment/verify` call must include `purpose: 'umoney'` and `userId` in the body. Check the Razorpay verify payload from the frontend.

**Loyalty stamps not incrementing**
→ Stamps only increment when status transitions to `Picked` via `updateOrderStatus` (PATCH route). The `pickupByCode` route also sets status to `Picked` but does not award stamps — this could be a future fix.
