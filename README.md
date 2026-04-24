# Campus Eats 🍔

**Campus Eats** is a full-stack, university-wide food ordering ecosystem designed to bridge the gap between students and campus food outlets. It offers a premium, modern interface for browsing menus, managing a digital wallet, and tracking orders in real-time.

![Campus Eats Preview](https://img.shields.io/badge/Status-Complete-success)
![React](https://img.shields.io/badge/Frontend-React%2019-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-emerald)

## 🚀 Key Features

- **🛍️ Seamless Ordering**: Browse multiple outlets, customize carts, and place orders in seconds.
- **💳 Unified Payments**: Support for both **U-Money** (Internal Wallet) and **Razorpay** (External Gateway).
- **📦 Order Lifecycle**: Real-time tracking from "Pending" to "Picked Up" with vendor-side QR code verification.
- **💳 U-Money Wallet**: Instant top-ups and one-tap checkout for a frictionless campus experience.
- **🎁 Loyalty & Rewards**: Integrated stamp card system and reward points for every purchase.
- **🏪 Vendor Dashboard**: Comprehensive management tool for outlet staff to accept, prepare, and verify orders.
- **🌟 Feedback System**: Direct line for users to rate the platform and provide valuable service feedback.
- **🗺️ Campus Mapping**: Integrated maps to help students locate new stalls and outlets easily.

## 🛠️ Technology Stack

### Frontend
- **React 19** & **Vite** (Core Framework)
- **Tailwind CSS** (Utility-first styling & Dark Mode)
- **Context API** (Global state management)
- **Boxicons** (Premium iconography)

### Backend
- **Node.js** & **Express** (RESTful API)
- **MongoDB** & **Mongoose** (Database & ODM)
- **JWT** (Stateless authentication)
- **BcryptJS** (Secure password hashing)

### Integrations
- **Razorpay** (Digital payment processing)
- **jsQR** (Frontend QR code decoding)

## 📂 Project Structure

```text
Campus Eats/
├── frontend/                # React application (Vite + Tailwind)
│   ├── README.md            ← Frontend specific documentation
│   └── ...
├── backend/                 # Node.js API (Express + MongoDB)
│   ├── README.md            ← Backend specific documentation
│   └── ...
└── package.json             # Root workspace configuration
```

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance
- Razorpay API Keys (for payment testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rishabhhh2005/Campus-Eats.git
   cd Campus-Eats
   ```

2. **Install all dependencies:**
   The project uses npm workspaces. You can install all dependencies from the root:
   ```bash
   npm run install-all
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the `backend/` directory (see `backend/.env.example`).
   - Create a `.env` file in the `frontend/` directory (see `frontend/README.md`).

4. **Run the application:**
   Launch both frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```

## 📖 documentation

For detailed technical documentation on each module, please refer to the individual README files:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

---

Developed as a professional solution for university dining management.  
**Built by Rishabh Puri**
