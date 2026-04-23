import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connectDB.js';

// Import Routes
import campusRoutes from './routes/campusRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import loyaltyRoutes from './routes/loyaltyRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pickupRoutes from './routes/pickupRoutes.js';
import acceptRoutes from './routes/acceptRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
connectDB();

// Route Middlewares
app.use('/api/campuses', campusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/umoney', walletRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/accept', acceptRoutes);

// Start Server
app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on port ${port}`);
});
