import { Request, RequestHandler, Response } from "express";
import { OrderService } from "./order.service";

export class OrderController {
	constructor(private readonly orderService: OrderService) {}

	/*******************************************************
	 ****************** GET HANDLERS ************************
	 ******************************************************** */

	getMyOrders = async (req: Request, res: Response): Promise<void> => {
		const orders = await this.orderService.getMyOrders(req.user.id);
		res.status(200).json({
			status: "success",
			data: { orders },
		});
	};

	/*******************************************************
	 ****************** POST HANDLERS ***********************
	 ******************************************************** */

	createOrder = async (req: Request, res: Response): Promise<void> => {
		const order = await this.orderService.createOrder(req.body);
		res.status(201).json({
			status: "success",
			data: { order },
		});
	};
}
