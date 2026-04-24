# Campus Eats — Frontend

A **React + Vite + Tailwind CSS** application providing a seamless food ordering experience for university campuses.

## Features

- **Outlet Browsing**: Explore menus from various campus stalls and outlets.
- **Smart Search**: Find dishes or outlets instantly with a real-time search interface.
- **Digital Wallet (U-Money)**: Integrated wallet system for quick payments without external gateways.
- **Razorpay Integration**: Native support for UPI, Card, and Net-banking payments.
- **Order Tracking**: Real-time status updates from "Pending" to "Picked Up".
- **Vendor Dashboard**: Dedicated interface for canteen staff to manage orders via QR code scanning or manual entry.
- **Loyalty & Rewards**: Earn stamps for every order and points for every rupee spent.
- **Interactive Map**: Locate outlets across the campus using integrated maps.
- **Dark Mode**: Fully responsive design with native dark mode support.

## Tech Stack

| Tool | Role |
|---|---|
| **React 19** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Utility-first Styling |
| **React Router** | Navigation & Routing |
| **Context API** | Global State Management (Auth, Campus, UI) |
| **React-Leaflet** | Campus Map Integration |
| **jsQR** | Vendor-side QR Code Scanning |
| **Boxicons** | Modern iconography |

## Directory Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI elements (Navbar, Cards, Modals)
│   ├── context/         # AuthContext, CampusContext for global state
│   ├── pages/           # Main route views
│   │   ├── Home.jsx     # Discovery & Search
│   │   ├── Cart.jsx     # Checkout & Payment logic
│   │   ├── Orders.jsx   # Order history & Tracking
│   │   ├── Account.jsx  # Profile & Preferences
│   │   ├── Vendor.jsx   # Staff Dashboard
│   │   ├── Review.jsx   # Feedback & Ratings
│   │   └── Wallet.jsx   # Balance & Transactions
│   ├── data/            # Static configuration (Campuses, Outlets)
│   ├── utils/           # API handlers (fetch wrappers)
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── tailwind.config.js   # Styling configuration
└── vite.config.js       # Build settings
```

## Global State Management

### AuthContext
Handles user registration, login, and session persistence. It stores the JWT in `localStorage` and provides a `user` object and `logout` function to the entire app.

### CampusContext
Manages the user's selected campus. It ensures that the menus and outlets displayed across the app are filtered to the user's current location.

## API Integration

All backend communication is centralized in `src/utils/api.js`. This module handles:
- Authorization headers for protected routes.
- Error parsing and user-friendly error messages.
- Purpose-built functions for Orders, Payments, and Feedback.

## Key Design Decisions

1. **Mobile-First Responsive Design**: The UI is optimized for students ordering on the go, with large touch targets and simplified flows.
2. **Skeleton & Loading States**: Uses smooth transitions and loading indicators to ensure a premium feel even on slower campus networks.
3. **Optimistic UI**: Updates local state (like cart count or wallet balance) immediately while syncing with the server in the background.
4. **QR Code Scanning**: Uses `jsQR` to decode pickup codes from images, allowing vendor-side verification without specialized hardware.

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
