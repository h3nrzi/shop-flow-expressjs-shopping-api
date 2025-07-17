import { BadRequestError } from "../../errors/bad-request-error";
import { ForbiddenError } from "../../errors/forbidden-error";
import { NotFoundError } from "../../errors/not-found-error";
import ProductRepository from "../products/product.repository";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { OrderDoc } from "./order.interface";
import { OrderRepository } from "./order.repository";

export class OrderService {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly productRepository: ProductRepository,
	) {}

	/*******************************************************
	 ****************** GET HANDLERS ************************
	 ******************************************************** */

	async getAllOrders(): Promise<OrderDoc[]> {
		return this.orderRepository.findAll({});
	}

	async getCurrentUserOrders(userId: string): Promise<OrderDoc[]> {
		return this.orderRepository.findAll({ user: userId });
	}

	async getOrderById(orderId: string, userId: string, role: "admin" | "user"): Promise<OrderDoc | null> {
		// check if order exists, if not throw error
		const order = await this.orderRepository.findById(orderId);
		if (!order) {
			throw new NotFoundError("هیچ سفارشی با این شناسه یافت نشد");
		}

		// check if order belongs to user and role is user, if true throw error
		if (order.user.toString() !== userId && role === "user") {
			throw new ForbiddenError("شما اجازه دسترسی و ویرایش یا حذف این سفارش را ندارید");
		}

		return order;
	}

	async getAllTopsOrders(limit: number): Promise<OrderDoc[]> {
		return this.orderRepository.findAllTops(10);
	}

	/*******************************************************
	 ****************** POST HANDLERS ************************
	 ******************************************************** */

	async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<OrderDoc> {
		return this.orderRepository.create(createOrderDto, userId);
	}

	/*******************************************************
	 ****************** PATCH HANDLERS **********************
	 ******************************************************** */

	async updateOrder(
		orderId: string,
		updateOrderDto: UpdateOrderDto,
		userId: string,
		role: "admin" | "user",
	): Promise<OrderDoc | null> {
		// check if order exists, if not throw error
		// check if order belongs to user, if not throw error
		await this.getOrderById(orderId, userId, role);

		// update order
		return this.orderRepository.updateById(orderId, updateOrderDto);
	}

	async updateOrderToPaid(orderId: string, userId: string, role: "admin" | "user") {
		// check if order exists, if not throw error
		// check if order belongs to user, if not throw error
		const order = await this.getOrderById(orderId, userId, role);

		// update order
		order!.isPaid = true;
		order!.paidAt = new Date();

		// update product stock
		for (const item of order!.orderItems) {
			// check if product exists, if not throw error
			const productId = item.product.toString();
			const product = await this.productRepository.getOne(productId);
			if (!product) {
				throw new NotFoundError("محصولی با این شناسه یافت نشد");
			}

			// check if product has enough stock, if not throw error
			if (product.countInStock <= 0 || product.countInStock < item.qty) {
				throw new BadRequestError("موجودی محصول کافی نیست");
			}

			// update product stock
			product.countInStock -= item.qty;
			await product.save();
		}

		// save order and return it
		return order!.save();
	}

	async updateOrderToDeliver(orderId: string, userId: string, role: "admin" | "user") {
		// check if order exists, if not throw error
		// check if order belongs to user, if not throw error
		const order = await this.getOrderById(orderId, userId, role);

		// Update order and save it into database
		order!.isDelivered = true;
		order!.deliveredAt = new Date(Date.now());
		const updatedOrder = await order!.save();

		return updatedOrder;
	}

	/*******************************************************
	 ****************** DELETE HANDLERS **********************
	 ******************************************************** */

	async deleteOrder(orderId: string, userId: string, role: "admin" | "user"): Promise<OrderDoc | null> {
		// check if order exists, if not throw error
		// check if order belongs to user, if not throw error
		await this.getOrderById(orderId, userId, role);

		// delete order
		return this.orderRepository.deleteById(orderId);
	}
}
