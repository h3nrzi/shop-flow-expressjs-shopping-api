import { OrderService } from "./order.service";

export class OrderController {
	constructor(private readonly orderService: OrderService) {}
}
