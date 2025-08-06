import { Request, Response } from "express";
import { UpdateOrderDto } from "./dtos/update-order.dto";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dtos/create-order.dto";
import { NotificationService } from "../notifications/application/notification.service";

export class OrderController {
	constructor(private readonly orderService: OrderService, private readonly notificationService: NotificationService) {}

	/*******************************************************
	 ****************** GET HANDLERS ************************
	 ******************************************************** */

	async getAllOrders(req: Request, res: Response) {
		const { pagination, orders } = await this.orderService.getAllOrders(req.query);

		res.status(200).json({
			status: "success",
			results: orders.length,
			pagination,
			data: { orders },
		});
	}

	async getCurrentUserOrders(req: Request, res: Response) {
		const { pagination, orders } = await this.orderService.getCurrentUserOrders(req.user.id, req.query);

		res.status(200).json({
			status: "success",
			results: orders.length,
			pagination,
			data: { orders },
		});
	}

	getOrderById = async (req: Request, res: Response): Promise<void> => {
		const order = await this.orderService.getOrderById(req.params.id, req.user.id, req.user.role);
		res.status(200).json({
			status: "success",
			data: { order },
		});
	};

	getAllTopsOrders = async (req: Request, res: Response): Promise<void> => {
		const orders = await this.orderService.getAllTopsOrders(10);
		res.status(200).json({
			status: "success",
			results: orders.length,
			data: { orders },
		});
	};

	/*******************************************************
	 ****************** POST HANDLERS ***********************
	 ******************************************************** */

	createOrder = async (req: Request, res: Response): Promise<void> => {
		const createOrderDto = req.body as CreateOrderDto;
		const userId = req.user.id;

		const order = await this.orderService.createOrder(createOrderDto, userId);

		this.notificationService.createNotification({
			user: userId,
			title: "سفارش جدید",
			message: "سفارش شما با موفقیت ثبت شد",
			type: "order",
			data: { ...order },
		});

		res.status(201).json({
			status: "success",
			data: { order },
		});
	};

	/*******************************************************
	 ****************** PATCH HANDLERS **********************
	 ******************************************************** */

	updateOrder = async (req: Request, res: Response): Promise<void> => {
		const order = await this.orderService.updateOrder(req.params.id, req.body as UpdateOrderDto, req.user.id, req.user.role);
		res.status(200).json({
			status: "success",
			data: { order },
		});
	};

	updateOrderToPaid = async (req: Request, res: Response): Promise<void> => {
		const orderId = req.params.id;
		const userId = req.user.id;

		const order = await this.orderService.updateOrderToPaid(orderId, userId, req.user.role);

		this.notificationService.createNotification({
			user: userId,
			title: "پرداخت سفارش",
			message: "سفارش شما با موفقیت پرداخت شد",
			type: "order",
			data: { ...order },
		});

		res.status(200).json({
			status: "success",
			data: { order },
		});
	};

	updateOrderToDeliver = async (req: Request, res: Response): Promise<void> => {
		const orderId = req.params.id;
		const userId = req.user.id;

		const order = await this.orderService.updateOrderToDeliver(orderId, userId, req.user.role);

		this.notificationService.createNotification({
			user: userId,
			title: "ارسال سفارش",
			message: "سفارش شما با موفقیت ارسال شد",
			type: "order",
			data: { ...order },
		});

		res.status(200).json({
			status: "success",
			data: { order },
		});
	};

	/*******************************************************
	 ****************** DELETE HANDLERS *********************
	 ******************************************************** */

	deleteOrder = async (req: Request, res: Response): Promise<void> => {
		await this.orderService.deleteOrder(req.params.id, req.user.id, req.user.role);
		res.status(204);
		res.json({
			status: "success",
		});
	};
}
