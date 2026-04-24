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
import walletRoutes from './routes/walletRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
connectDB();

// Route Middlewares
app.use('/api', authRoutes);
app.use('/api', campusRoutes);
app.use('/api', orderRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', loyaltyRoutes);
app.use('/api', walletRoutes);
app.use('/api', paymentRoutes);



// Start Server
app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on port ${port}`);
});
