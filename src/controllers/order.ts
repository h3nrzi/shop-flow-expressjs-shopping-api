import CrudController from "./crud";
import { Populate } from "../types";
import Order from "../models/order";
import { RequestHandler, Response } from "express";
import AppError from "../utils/appError";
import Product from "../_refactor/products/entities/product.entity";

class OrderController extends CrudController {
	constructor(populate?: Populate) {
		super(Order, populate);
	}

	updateOrderToPaid: RequestHandler = async (req, res, next) => {
		const order = await Order.findById(req.params.id);

		if (!order) {
			const msg = "هیچ موردی با این شناسه یافت نشد";
			return next(new AppError(msg, 404));
		}

		order.isPaid = true;
		order.paidAt = new Date();

		const updateStockPromises = order.orderItems.map(async item => {
			const product = await Product.findById(item.product);

			if (!product) {
				const msg = `محصولی با شناسه ${item.product} یافت نشد`;
				throw new AppError(msg, 404);
			}

			if (product.countInStock <= 0 && product.countInStock < item.qty) {
				const msg = `موجودی محصول ${product.name} کافی نیست`;
				throw new AppError(msg, 400);
			}

			product.countInStock -= item.qty;
			await product.save();
		});

		await Promise.all(updateStockPromises);
		const updatedOrder = await order.save();

		return this.sendCrudResponse(res, updatedOrder, 200);
	};

	updateOrderToDeliver: RequestHandler = async (req, res, next) => {
		const order = await Order.findById(req.params.id);

		if (!order) {
			const msg = "هیچ موردی با این شناسه یافت  نشد";
			return next(new AppError(msg, 404));
		}

		order.isDelivered = true;
		order.deliveredAt = new Date(Date.now());
		const updatedOrder = await order.save();

		return this.sendCrudResponse(res, updatedOrder, 200);
	};

	getAllTops: RequestHandler = async (req, res, next) => {
		const limit = parseInt(req.query.limit as string) || 10;

		const TopSellingProducts = await Order.aggregate([
			{ $unwind: "$orderItems" },
			{
				$group: {
					_id: "$orderItems.product",
					totalSold: { $sum: "$orderItems.qty" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: limit },
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

		res.status(200).json({
			status: "success",
			result: TopSellingProducts.length,
			data: TopSellingProducts,
		});
	};

	protected override sendCrudResponse(
		res: Response,
		data: any,
		statusCode: number,
		pagination?: any,
	) {
		res.status(statusCode).json({
			status: "success",
			results: Array.isArray(data) ? data.length : undefined,
			pagination,
			data: Array.isArray(data) ? { orders: data } : { order: data },
		});
	}
}

const orderController = new OrderController({
	path: "user orderItems.product",
});
export default orderController;
