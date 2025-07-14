import { CreateOrderDto } from "./dtos/create-order.dto";
import { OrderDoc } from "./order.interface";
import { OrderRepository } from "./order.repository";

export class OrderService {
	constructor(private readonly orderRepository: OrderRepository) {}

	async getMyOrders(userId: string): Promise<OrderDoc[]> {
		return this.orderRepository.findAll({ user: userId });
	}

	async createOrder(payload: CreateOrderDto): Promise<OrderDoc> {
		return this.orderRepository.create(payload);
	}
}
