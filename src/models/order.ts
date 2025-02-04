import { model, Schema } from "mongoose";
import IOrder from "../types/Order";

const orderItemSchema = new Schema({
	product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
	qty: { type: Number, required: true },
});

const shippingAddressSchema = new Schema({
	province: { type: String, required: true },
	city: { type: String, required: true },
	street: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>(
	{
		user: { type: Schema.Types.ObjectId, ref: "User", required: true },

		orderItems: [orderItemSchema],
		shippingAddress: shippingAddressSchema,
		paymentMethod: { type: String, required: true },

		itemsPrice: { type: Number, required: true },
		shippingPrice: { type: Number, default: 0.0 },
		taxPrice: { type: Number, default: 0.0 },
		totalPrice: { type: Number, required: true },

		// paymentResult: paymentResultSchema,
		isPaid: { type: Boolean, default: false },
		isDelivered: { type: Boolean, default: false },

		paidAt: { type: Date },
		deliveredAt: { type: Date },
	},
	{ timestamps: true },
);

const Order = model<IOrder>("Order", orderSchema);
export default Order;
