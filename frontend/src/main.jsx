import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { CartProvider } from "./context/CartContext.jsx";  // 👈 use existing context
import { CampusProvider } from "./context/CampusContext.jsx";
import ScrollToTop from "./components/ScrollToTop";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ScrollToTop>
      <CampusProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </CampusProvider>
    </ScrollToTop>
  </BrowserRouter>
);
