import express from "express";
import { body, param } from "express-validator";
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
	.post(
		body("orderItems").isArray().withMessage("محصولات الزامی است"),
		body("shippingAddress").isObject().withMessage("آدرس الزامی است"),
		body("paymentMethod").isString().withMessage("روش پرداخت الزامی است"),
		body("itemsPrice").isNumeric().withMessage("قیمت محصولات الزامی است"),
		body("shippingPrice").isNumeric().withMessage("قیمت حمل و نقل الزامی است"),
		body("taxPrice").isNumeric().withMessage("مالیات الزامی است"),
		body("totalPrice").isNumeric().withMessage("قیمت کل الزامی است"),
		validateRequest,
		orderController.createOrder.bind(orderController)
	);

router
	.route("/get-myorders")
	.get(
		orderMiddleware.getMyOrders,
		orderController.getCurrentUserOrders.bind(orderController)
	);

router
	.route("/top-selling-products")
	.get(orderController.getAllTopsOrders.bind(orderController));

router
	.route("/:id")
	.get(
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.getOrderById.bind(orderController)
	);

router
	.route("/:id/pay")
	.patch(
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.updateOrderToPaid.bind(orderController)
	);

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router.route("/").get(orderController.getAllOrders.bind(orderController));

router
	.route("/:id")
	.patch(
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.updateOrder.bind(orderController)
	)
	.delete(
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.deleteOrder.bind(orderController)
	);

router
	.route("/:id/deliver")
	.patch(
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.updateOrderToDeliver.bind(orderController)
	);

export { router as orderRouter };
