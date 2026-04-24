import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	userName: { type: String, required: true },
	rating: { type: Number, required: true, min: 1, max: 5 },
	comment: { type: String, required: true, trim: true },
	timestamp: { type: Date, default: Date.now }
}, {
	versionKey: false
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
export default Feedback;
