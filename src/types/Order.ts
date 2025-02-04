import { Document } from "mongoose";

interface IOrderItem extends Document {
	product: Document["_id"];
	qty: number;
}

interface IShippingAddress extends Document {
	province: string;
	city: string;
	street: string;
}

export default interface IOrder extends Document {
	user: Document["_id"];

	orderItems: IOrderItem[];
	shippingAddress: IShippingAddress;
	paymentMethod: string;

	itemsPrice: number;
	shippingPrice: number; // default: 0.0
	taxPrice: number; // default: 0.0
	totalPrice: number;

	isPaid: boolean; // default: false
	isDelivered: boolean; // default: false

	paidAt?: Date;
	deliveredAt?: Date;

	createdAt: Date;
	updatedAt?: Date;
}
