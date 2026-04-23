import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";

// Helper: fetch with timeout using AbortController
async function fetchWithTimeout(resource, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }, 10000);
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.user) setUser(data.user);
          else logout();
        } catch (err) {
          console.error('Auth me error:', (err && err.name) === 'AbortError' ? 'Request timed out' : err);
          logout();
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }, 10000);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Login failed' };
    } catch (err) {
      console.error('Login network/error:', (err && err.name) === 'AbortError' ? 'Request timed out' : err);
      return { success: false, error: (err && err.name) === 'AbortError' ? 'Request timed out' : (err && err.message) || 'Network error' };
    }
  };

  const signup = async (email, password, name, phone) => {
    try {
      const res = await fetchWithTimeout(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone })
      }, 10000);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || data.message || 'Signup failed' };
    } catch (err) {
      console.error('Signup network/error:', (err && err.name) === 'AbortError' ? 'Request timed out' : err);
      return { success: false, error: (err && err.name) === 'AbortError' ? 'Request timed out' : (err && err.message) || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
