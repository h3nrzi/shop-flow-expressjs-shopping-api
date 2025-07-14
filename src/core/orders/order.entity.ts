import mongoose from "mongoose";
import {
	IOrderItem,
	IShippingAddress,
	OrderDoc,
	OrderModel,
} from "./order.interface";

const orderItemSchema = new mongoose.Schema<IOrderItem>({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	qty: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema<IShippingAddress>({
	province: { type: String, required: true },
	city: { type: String, required: true },
	street: { type: String, required: true },
});

const orderSchema = new mongoose.Schema<OrderDoc>(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		orderItems: { type: [orderItemSchema], required: true },

		shippingAddress: { type: shippingAddressSchema, required: true },
		paymentMethod: { type: String, required: true },

		itemsPrice: { type: Number, required: true },
		shippingPrice: { type: Number, default: 0.0 },
		taxPrice: { type: Number, default: 0.0 },
		totalPrice: { type: Number, required: true },

		isPaid: { type: Boolean, default: false },
		isDelivered: { type: Boolean, default: false },

		paidAt: { type: Date }, // optional
		deliveredAt: { type: Date }, // optional
	},
	{ timestamps: true }
);

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);
export default Order;
