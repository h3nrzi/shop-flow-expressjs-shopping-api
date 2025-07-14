import { FilterQuery } from "mongoose";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import Order from "./order.entity";
import { OrderDoc, OrderModel } from "./order.interface";

export class OrderRepository {
	constructor(private readonly orderModel: OrderModel = Order) {}

	/* ********************************************************
	 ****************** QUERIES OPERATIONS ********************
	 ******************************************************** */

	async findAll(query: FilterQuery<OrderDoc>): Promise<OrderDoc[]> {
		return this.orderModel.find(query);
	}

	async findById(orderId: string): Promise<OrderDoc | null> {
		return this.orderModel.findById(orderId);
	}

	/* ********************************************************
	 ****************** MUTATIONS OPERATIONS ******************
	 ******************************************************** */

	async create(payload: CreateOrderDto): Promise<OrderDoc> {
		return this.orderModel.create(payload);
	}

	async updateById(
		orderId: string,
		payload: UpdateOrderDto
	): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndUpdate(orderId, payload, { new: true });
	}

	async deleteById(orderId: string): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndDelete(orderId);
	}
}
