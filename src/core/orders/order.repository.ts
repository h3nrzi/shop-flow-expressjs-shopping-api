import { FilterQuery } from "mongoose";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { OrderDoc, OrderModel } from "./order.interface";

export class OrderRepository {
	constructor(private readonly orderModel: OrderModel) {}

	/* ********************************************************
	 ****************** QUERIES OPERATIONS ********************
	 ******************************************************** */

	async findAll(
		query: FilterQuery<OrderDoc>,
	): Promise<OrderDoc[]> {
		return this.orderModel.find(query);
	}

	async findAllTops(limit: number): Promise<OrderDoc[]> {
		return this.orderModel.aggregate([
			{
				$unwind: "$orderItems",
			},
			{
				$group: {
					_id: "$orderItems.product",
					totalSold: { $sum: "$orderItems.qty" },
				},
			},
			{
				$sort: { totalSold: -1 },
			},
			{
				$limit: limit,
			},
			{
				$lookup: {
					from: "products",
					localField: "_id",
					foreignField: "_id",
					as: "product",
				},
			},
			{
				$project: {
					_id: 0,
				},
			},
		]);
	}

	async findById(orderId: string): Promise<OrderDoc | null> {
		return this.orderModel.findById(orderId);
	}

	/* ********************************************************
	 ****************** MUTATIONS OPERATIONS ******************
	 ******************************************************** */

	async create(
		payload: CreateOrderDto,
		userId: string,
	): Promise<OrderDoc> {
		return this.orderModel.create({
			...payload,
			user: userId,
			orderItems: payload.orderItems.map(item => ({
				product: item.productId,
				qty: item.qty,
			})),
		});
	}

	async updateById(
		orderId: string,
		payload: UpdateOrderDto,
	): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndUpdate(orderId, payload, {
			new: true,
		});
	}

	async deleteById(orderId: string): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndDelete(orderId);
	}
}
