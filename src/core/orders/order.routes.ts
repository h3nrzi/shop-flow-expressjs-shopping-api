import express from "express";
import Order from "./order.entity";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import authMiddleware from "../../middlewares/auth";
import orderMiddleware from "../../middlewares/order";

const orderRouter = express.Router();
const orderRepository = new OrderRepository(Order);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
orderRouter.use(authMiddleware.protect);

/**
 * @description 	Create order
 * @route POST 		/orders
 * @access USER
 */
orderRouter
	.route("/")
	.post(
		orderMiddleware.beforeCreate,
		orderController.createOrder.bind(orderController)
	);

/**
 * @description 	Get current user orders
 * @route GET 		/orders/get-myorders
 * @access USER
 */
orderRouter
	.route("/get-myorders")
	.get(
		orderMiddleware.getMyOrders,
		orderController.getAllOrders.bind(orderController)
	);

/**
 * @description 	Get all top selling products
 * @route GET 		/orders/top-selling-products
 * @access ADMIN
 */
orderRouter
	.route("/top-selling-products")
	.get(orderController.getAllTopsOrders.bind(orderController));

/**
 * @description 	Update order to paid
 * @route PATCH 		/orders/:id/pay
 * @access USER
 */
orderRouter
	.route("/:id/pay")
	.patch(orderController.updateOrderToPaid.bind(orderController));

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
orderRouter.use(authMiddleware.restrictTo("admin"));

/**
 * @description 	Get all orders
 * @route GET 		/orders
 * @access ADMIN
 */
orderRouter.route("/").get(orderController.getAllOrders.bind(orderController));

/**
 * @description 	Get & update & delete order by id
 * @route GET 		/orders
 * @route GET 		/orders/:id
 * @route PATCH 	/orders/:id
 * @route DELETE 	/orders/:id
 * @access ADMIN
 */
orderRouter
	.route("/:id")
	.get(orderController.getOrderById.bind(orderController))
	.patch(
		orderMiddleware.beforeUpdate,
		orderController.updateOrder.bind(orderController)
	)
	.delete(orderController.deleteOrder.bind(orderController));

/**
 * @description 	Update order to delivered
 * @route PATCH 	/orders/:id/deliver
 * @access ADMIN
 */
orderRouter
	.route("/:id/deliver")
	.patch(orderController.updateOrderToDeliver.bind(orderController));

export default orderRouter;
