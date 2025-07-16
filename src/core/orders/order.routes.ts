import express from "express";
import { body } from "express-validator";
import { orderController } from "..";
import authMiddleware from "../../middlewares/auth";
import orderMiddleware from "../../middlewares/order";
import { validateRequest } from "../../middlewares/validate-request";

const router = express.Router();

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

router
	.route("/")
	.post([
		body("orderItems").isArray().withMessage("محصولات الزامی است"),
		body("shippingAddress").isObject().withMessage("آدرس الزامی است"),
		body("paymentMethod").isString().withMessage("روش پرداخت الزامی است"),
		body("itemsPrice").isNumeric().withMessage("قیمت محصولات الزامی است"),
		body("shippingPrice").isNumeric().withMessage("قیمت حمل و نقل الزامی است"),
		body("taxPrice").isNumeric().withMessage("مالیات الزامی است"),
		body("totalPrice").isNumeric().withMessage("قیمت کل الزامی است"),
		validateRequest,
		orderMiddleware.beforeCreate,
		orderController.createOrder.bind(orderController),
	]);

router
	.route("/get-myorders")
	.get(
		orderMiddleware.getMyOrders,
		orderController.getCurrentUserOrders.bind(orderController)
	);

router
	.route("/top-selling-products")
	.get(orderController.getAllTopsOrders.bind(orderController));

router.route("/:id").get(orderController.getOrderById.bind(orderController));

router
	.route("/:id/pay")
	.patch(orderController.updateOrderToPaid.bind(orderController));

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router.route("/").get(orderController.getAllOrders.bind(orderController));

router
	.route("/:id")
	.patch(
		orderMiddleware.beforeUpdate,
		orderController.updateOrder.bind(orderController)
	)
	.delete(orderController.deleteOrder.bind(orderController));

router
	.route("/:id/deliver")
	.patch(orderController.updateOrderToDeliver.bind(orderController));

export { router as orderRouter };
