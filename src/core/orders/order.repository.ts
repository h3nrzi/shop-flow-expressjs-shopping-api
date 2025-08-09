import APIFeatures from "../../utils/apiFeatures";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { OrderDoc, OrderModel } from "./order.interface";

export class OrderRepository {
	constructor(private readonly orderModel: OrderModel) {}

	/* ********************************************************
	 ****************** QUERIES OPERATIONS ********************
	 ******************************************************** */

	async findAll(
		query: any,
		initialFilter?: any,
		populate?: string
	): Promise<{
		pagination: any;
		skip: number;
		total: number;
		orders: OrderDoc[];
	}> {
		const features = new APIFeatures(
			this.orderModel as any,
			query,
			initialFilter,
			populate
		);
		const { pagination, skip, total } = await features
			.filter()
			.search()
			.sort()
			.limitFields()
			.pagination();

		const orders = await features.dbQuery;

		return {
			pagination,
			skip,
			total,
			orders,
		};
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

	async findById(orderId: string, populate?: string): Promise<OrderDoc | null> {
		return this.orderModel.findById(orderId).populate(populate || "");
	}

	/* ********************************************************
	 ****************** MUTATIONS OPERATIONS ******************
	 ******************************************************** */

	async create(payload: CreateOrderDto, userId: string): Promise<OrderDoc> {
		// Validate that orderItems exists and is an array
		if (!payload.orderItems || !Array.isArray(payload.orderItems)) {
			throw new Error("orderItems is required and must be an array");
		}

		return this.orderModel.create({
			...payload,
			user: userId,
			orderItems: payload.orderItems.map((item) => ({
				product: item.productId,
				qty: item.qty,
			})),
		});
	}

	async updateById(
		orderId: string,
		payload: UpdateOrderDto
	): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndUpdate(orderId, payload, {
			new: true,
		});
	}

	async deleteById(orderId: string): Promise<OrderDoc | null> {
		return this.orderModel.findByIdAndDelete(orderId);
	}
}
