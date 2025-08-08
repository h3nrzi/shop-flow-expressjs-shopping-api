import mongoose from "mongoose";
import {
	IOrderItem,
	IShippingAddress,
	OrderDoc,
	OrderModel,
} from "./order.interface";

const orderItemSchema = new mongoose.Schema<IOrderItem>(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		qty: { type: Number, required: true },
	},
	{
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	},
);

const shippingAddressSchema = new mongoose.Schema<IShippingAddress>(
	{
		province: { type: String, required: true },
		city: { type: String, required: true },
		street: { type: String, required: true },
	},
	{
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
			},
		},
	},
);

const orderSchema = new mongoose.Schema<OrderDoc>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

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
	{
		timestamps: true,
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
);

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);
export { Order };
