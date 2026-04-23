// src/App.jsx

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Orders from "./pages/Orders.jsx";
import Account from "./pages/Account.jsx";
import Contact from "./pages/Contact.jsx";
import Outlet from "./pages/Outlet.jsx";
import Cart from "./pages/Cart.jsx";
import Vendor from "./pages/Vendor.jsx";
import Wallet from "./pages/Wallet.jsx";
// OffersPopup removed as per UX request
import AuthModal from "./components/AuthModal.jsx";
import VendorModal from "./components/VendorModal.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Navbar authModalOpen={showAuthModal} setAuthModalOpen={setShowAuthModal} setVendorModalOpen={setShowVendorModal} />
          <main className="flex-1 container-pad py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/order-food" />} />
              <Route path="/order-food" element={<Home />} />
              <Route path="/orders" element={<Orders openAuthModal={() => setShowAuthModal(true)} />} />
              <Route path="/account" element={<Account />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/outlet/:slug" element={<Outlet />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="*" element={<div className="text-center py-20">404</div>} />
            </Routes>
          </main>
          <Footer />
          {/* Offers popup removed per request */}
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
          <VendorModal isOpen={showVendorModal} onClose={() => setShowVendorModal(false)} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
