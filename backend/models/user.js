import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true },
	name: { type: String, required: true, trim: true },
	phone: { type: String, trim: true },
	hostel: { type: String, trim: true }, // For recommendations
	loyaltyStamps: { type: Number, default: 0 }, // Loyalty system
	rewardPoints: { type: Number, default: 0 }, // Reward points
	uMoneyBalance: { type: Number, default: 0 }, // U-Money wallet
	createdAt: { type: Date, default: Date.now }
}, {
	versionKey: false
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
