import AppError from "../../utils/appError";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrderDoc } from "./order.interface";
import { OrderRepository } from "./order.repository";

export class OrderService {
	constructor(private readonly orderRepository: OrderRepository) {}

	/*******************************************************
	 ****************** GET HANDLERS ************************
	 ******************************************************** */

	async getMyOrders(userId: string): Promise<OrderDoc[]> {
		return this.orderRepository.findAll({ user: userId });
	}

	async getOrderById(
		orderId: string,
		userId: string
	): Promise<OrderDoc | null> {
		// check if order exists, if not throw error
		const order = await this.orderRepository.findById(orderId);
		if (!order) {
			throw new AppError("هیچ سفارشی با این شناسه یافت نشد", 404);
		}

		// check if order belongs to user, if not throw error
		if (order.user.toString() !== userId) {
			throw new AppError("شما اجازه دسترسی به این سفارش را ندارید", 403);
		}

		return order;
	}

	/*******************************************************
	 ****************** POST HANDLERS ************************
	 ******************************************************** */

	async createOrder(payload: CreateOrderDto): Promise<OrderDoc> {
		return this.orderRepository.create(payload);
	}
}
