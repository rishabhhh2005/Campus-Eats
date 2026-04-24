import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connectDB.js';

import authRoutes    from './routes/authRoutes.js';
import campusRoutes  from './routes/campusRoutes.js';
import orderRoutes   from './routes/orderRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import walletRoutes  from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/loyalty',  loyaltyRoutes);
app.use('/api/wallet',   walletRoutes);
app.use('/api/payment',  paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
