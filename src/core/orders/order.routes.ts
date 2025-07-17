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
	.post([
		body("orderItems[*].productId").isMongoId().withMessage("شناسه محصول معتبر نیست"),
		body("orderItems[*].qty").isInt({ min: 1 }).withMessage("تعداد محصولات الزامی است"),
		body("shippingAddress.province").isString().withMessage("استان الزامی است"),
		body("shippingAddress.city").isString().withMessage("شهر الزامی است"),
		body("shippingAddress.street").isString().withMessage("خیابان الزامی است"),
		body("paymentMethod").isString().withMessage("روش پرداخت الزامی است"),
		body("itemsPrice").isNumeric().withMessage("قیمت محصولات الزامی است"),
		body("shippingPrice").isNumeric().withMessage("قیمت حمل و نقل الزامی است"),
		body("taxPrice").isNumeric().withMessage("مالیات الزامی است"),
		body("totalPrice").isNumeric().withMessage("قیمت کل الزامی است"),
		validateRequest,
		orderController.createOrder.bind(orderController),
	]);

router
	.route("/get-myorders")
	.get(orderMiddleware.getMyOrders, orderController.getCurrentUserOrders.bind(orderController));

router.route("/top-selling-products").get(orderController.getAllTopsOrders.bind(orderController));

router
	.route("/:id")
	.get([
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.getOrderById.bind(orderController),
	]);

router
	.route("/:id/pay")
	.patch([
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.updateOrderToPaid.bind(orderController),
	]);

/************************************************************************
 *********  @description Protect all routes below to admin only *********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router.route("/").get(orderController.getAllOrders.bind(orderController));

router
	.route("/:id")
	.patch([
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		body("orderItems[*].productId").optional().isMongoId().withMessage("فرمت شناسه محصول معتبر نیست"),
		body("orderItems[*].qty").optional().isInt({ min: 1 }).withMessage("فرمت تعداد محصولات معتبر نیست"),
		body("shippingAddress.province").optional().isString().withMessage("فرمت استان معتبر نیست"),
		body("shippingAddress.city").optional().isString().withMessage("فرمت شهر معتبر نیست"),
		body("shippingAddress.street").optional().isString().withMessage("فرمت خیابان معتبر نیست"),
		body("paymentMethod").optional().isString().withMessage("فرمت روش پرداخت معتبر نیست"),
		body("itemsPrice").optional().isNumeric().withMessage("فرمت قیمت محصولات معتبر نیست"),
		body("shippingPrice").optional().isNumeric().withMessage("فرمت قیمت حمل و نقل معتبر نیست"),
		body("taxPrice").optional().isNumeric().withMessage("فرمت مالیات معتبر نیست"),
		body("totalPrice").optional().isNumeric().withMessage("فرمت قیمت کل معتبر نیست"),
		validateRequest,
		orderController.updateOrder.bind(orderController),
	])
	.delete([
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.deleteOrder.bind(orderController),
	]);

router
	.route("/:id/deliver")
	.patch([
		param("id").isMongoId().withMessage("شناسه سفارش معتبر نیست"),
		validateRequest,
		orderController.updateOrderToDeliver.bind(orderController),
	]);

export { router as orderRouter };
