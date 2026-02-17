import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	orderId: { type: String, required: true, index: true },
	itemId: { type: String, required: true, index: true },
	itemName: { type: String, required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	review: { type: String, trim: true },
	outlet: { type: String, required: true },
	campus: { type: String, required: true, default: 'Punjab' },
	timestamp: { type: Date, default: Date.now }
}, {
	versionKey: false
});

const Rating = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);
export default Rating;
