import { OrderRepository } from "./order.repository";

export class OrderService {
	constructor(private readonly orderRepository: OrderRepository) {}
}
