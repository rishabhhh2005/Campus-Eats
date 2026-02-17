import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	type: { type: String, enum: ['credit', 'debit'], required: true },
	amount: { type: Number, required: true, min: 0 },
	description: { type: String, required: true },
	timestamp: { type: Date, default: Date.now }
}, {
	versionKey: false
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;
