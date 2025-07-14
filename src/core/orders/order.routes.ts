import express from "express";
import Order from "./order.entity";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import authMiddleware from "../../middlewares/auth";
import orderMiddleware from "../../middlewares/order";

const router = express.Router();
const orderRepository = new OrderRepository(Order);
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

/**
 * @description 	Create order
 * @route POST 		/orders
 * @access USER
 */
router.route("/").post(
	// TODO: Validation rules
	// TODO: validateRequest
	orderMiddleware.beforeCreate,
	orderController.createOrder.bind(orderController)
);

/**
 * @description 	Get current user orders
 * @route GET 		/orders/get-myorders
 * @access USER
 */
router
	.route("/get-myorders")
	.get(
		orderMiddleware.getMyOrders,
		orderController.getMyOrders.bind(orderController)
	);

/**
 * @description 	Get all top selling products
 * @route GET 		/orders/top-selling-products
 * @access ADMIN
 */
// router
// 	.route("/top-selling-products")
// 	.get(orderController.getAllTopsOrders.bind(orderController));

/**
 * @description 	Get order by id
 * @route GET 		/orders/:id
 * @access USER
 */
router.route("/:id").get(orderController.getOrderById.bind(orderController));

/**
 * @description 	Update order to paid
 * @route PATCH 		/orders/:id/pay
 * @access USER
 */
// router
// 	.route("/:id/pay")
// 	.patch(orderController.updateOrderToPaid.bind(orderController));

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

/**
 * @description 	Get all orders
 * @route GET 		/orders
 * @access ADMIN
 */
// router.route("/").get(orderController.getAllOrders.bind(orderController));

/**
 * @description 	Update & delete order by id
 * @route PATCH 	/orders/:id
 * @route DELETE 	/orders/:id
 * @access ADMIN
 */
// router
// 	.patch(
// 		orderMiddleware.beforeUpdate,
// 		orderController.updateOrder.bind(orderController)
// 	)
// 	.delete(orderController.deleteOrder.bind(orderController));

/**
 * @description 	Update order to delivered
 * @route PATCH 	/orders/:id/deliver
 * @access ADMIN
 */
// router
// 	.route("/:id/deliver")
// 	.patch(orderController.updateOrderToDeliver.bind(orderController));

export { router as orderRouter };
