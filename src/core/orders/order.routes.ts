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

router.route("/").post(
	// TODO: Validation rules
	// TODO: validateRequest
	orderMiddleware.beforeCreate,
	orderController.createOrder.bind(orderController)
);

router
	.route("/get-myorders")
	.get(
		orderMiddleware.getMyOrders,
		orderController.getMyOrders.bind(orderController)
	);

// router
// 	.route("/top-selling-products")
// 	.get(orderController.getAllTopsOrders.bind(orderController));

router.route("/:id").get(orderController.getOrderById.bind(orderController));

// router
// 	.route("/:id/pay")
// 	.patch(orderController.updateOrderToPaid.bind(orderController));

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
// router.use(authMiddleware.restrictTo("admin"));

// router.route("/").get(orderController.getAllOrders.bind(orderController));

// router
// 	.patch(
// 		orderMiddleware.beforeUpdate,
// 		orderController.updateOrder.bind(orderController)
// 	)
// 	.delete(orderController.deleteOrder.bind(orderController));

// router
// 	.route("/:id/deliver")
// 	.patch(orderController.updateOrderToDeliver.bind(orderController));

export { router as orderRouter };
