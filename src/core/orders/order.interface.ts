import mongoose from "mongoose";
import { ProductDoc } from "../products/product.interface";
import { IUserDoc } from "../users/user.interface";

export interface IOrderItem {
	product: mongoose.Types.ObjectId | ProductDoc;
	qty: number;
}

export interface IShippingAddress {
	province: string;
	city: string;
	street: string;
}

export interface OrderDoc extends mongoose.Document {
	user: mongoose.Types.ObjectId | IUserDoc;
	orderItems: IOrderItem[];
	shippingAddress: IShippingAddress;
	paymentMethod: string;
	itemsPrice: number;
	shippingPrice: number;
	taxPrice: number;
	totalPrice: number;
	isPaid: boolean;
	isDelivered: boolean;
	paidAt?: Date;
	deliveredAt?: Date;
	createdAt: Date;
	updatedAt?: Date;
}

export interface OrderModel extends mongoose.Model<OrderDoc> {}
