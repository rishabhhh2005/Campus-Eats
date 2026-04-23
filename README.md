# Campus Eats

Campus Eats is a comprehensive, full-stack food ordering platform designed for university campuses. It streamlines the interaction between students and campus food outlets, providing an integrated experience for browsing menus, placing orders, and handling digital payments.

## Architecture and Technology Stack

### Frontend
- **React.js (v19)**: Built with **Vite** for optimized development and fast rendering.
- **Tailwind CSS**: Utilized for responsive, utility-first styling with integrated dark mode support.
- **React Router DOM**: Manages application navigation and routing.
- **React-Leaflet**: Integrates interactive campus maps for outlet locations.
- **QR-Scanner**: Enables vendor-side order verification via QR codes.
- **Context API**: Handles global state for authentication and UI themes.

### Backend
- **Node.js & Express.js**: Provides a robust and scalable RESTful API with a modular **Routes/Controllers/Middleware** architecture.
- **MongoDB & Mongoose**: NoSQL database used for storing users, orders, transactions, and reviews.
- **JWT & BcryptJS**: Ensures secure authentication and password encryption.
- **Razorpay Integration**: Facilitates secure digital payment processing.
- **Crypto**: Used for verifying server-side payment signatures.


## System Functionality and Workflows

### 1. Authentication and Security
- **Registration**: New users can register with their email and phone number. Passwords are encrypted using Salt-hashing.
- **Authorization**: On login, users receive a JSON Web Token (JWT) used to authorize subsequent requests to protected endpoints.
- **Session Persistence**: The system maintains user sessions securely across browser transitions.

### 2. Ordering Lifecycle
- **Discovery**: Users can browse various campus outlets and their respective menus.
- **Cart Management**: Real-time calculation of order totals and discounts.
- **Tracking**: Orders progress through defined stages: Pending, Accepted, Preparing, Ready, and Picked.
- **Verification**: Each order generates a unique 6-character pickup code or QR code for secure fulfillment.

### 3. Payment Systems
- **U-Money (Digital Wallet)**: An internal credit system allowing users to maintain a balance for quick transactions.
- **Direct Payments**: Native integration with Razorpay for UPI, card, and net banking transactions.
- **Verification**: All transactions are verified via server-side HMAC signature checks to prevent fraud.

### 4. Vendor Operations
- **Dashboard**: Vendors have access to a real-time order management interface.
- **Order Fulfillment**: Vendors can update order status and verify customer pickup codes to complete the transaction lifecycle.

### 5. Engagement Features
- **Loyalty Program**: Automatic tracking of loyalty stamps; completing milestones can trigger platform rewards.
- **Reward Points**: Users earn points based on transaction volume, which can be redeemed on future orders.
- **Recommendations**: Data-driven suggestions based on trending items and community ratings.

## Project Structure

```text
Campus Eats/
├── frontend/                # React Frontend Application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # State management providers
│   │   ├── pages/           # Route-specific views
│   │   ├── utils/           # API and helper utilities
│   │   └── data/            # Local static data and mock configurations
│   ├── tailwind.config.js   # Style configuration
│   └── vite.config.js       # Build tools configuration
│
└── backend/                 # Node.js + Express Backend (Modular Architecture)
    ├── config/              # External service initializations (Razorpay)
    ├── controllers/         # Request handlers and business logic
    ├── db/                  # Database connection logic
    ├── middleware/          # Auth and protection middleware
    ├── models/              # Mongoose data schemas
    ├── routes/              # API endpoint definitions
    ├── utils/               # Shared helper functions
    ├── .env                 # Environment configuration (Private)
    └── server.js            # Main entry point mounting all modules
```


## Local Development Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install required dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file with appropriate MongoDB URI and Razorpay credentials.
4. Launch the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install required dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```

## Deployment Considerations
Ensure that environment variables are correctly configured in the production environment. The backend handles CORS and security headers, but a proper reverse proxy (like Nginx) or a cloud-native hosting provider is recommended for high-availability deployments.

---
Developed as a professional solution for university dining management.
