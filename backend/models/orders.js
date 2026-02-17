import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
	id: { type: String, required: true },
	name: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	qty: { type: Number, required: true, min: 1 },
	image: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
	id: { type: String, required: true, index: true, unique: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	userName: { type: String, required: true },
	items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
	total: { type: Number, required: true, min: 0 },
	discount: { type: Number, required: true, min: 0, default: 0 },
	payable: { type: Number, required: true, min: 0 },
	outlet: { type: String, required: true },
	campus: { type: String, required: true, default: 'Punjab' },
	status: { type: String, enum: ['Pending','Accepted','Preparing','Ready','Picked'], default: 'Pending' },
	paid: { type: Boolean, default: false },
	timestamp: { type: Date, default: Date.now },
	pickupCode: { type: String, index: true }
}, {
	versionKey: false
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;