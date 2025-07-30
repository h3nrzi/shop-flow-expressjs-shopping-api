"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const __1 = require("..");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const order_1 = __importDefault(require("../../middlewares/order"));
const validate_request_1 = require("../../middlewares/validate-request");
const router = express_1.default.Router();
exports.orderRouter = router;
router
    .route("/top-selling-products")
    .get(__1.orderController.getAllTopsOrders.bind(__1.orderController));
router.use(auth_1.default.protect);
router
    .route("/")
    .post([
    (0, express_validator_1.body)("orderItems[*].productId")
        .isMongoId()
        .withMessage("شناسه محصول معتبر نیست"),
    (0, express_validator_1.body)("orderItems[*].qty")
        .isInt({ min: 1 })
        .withMessage("تعداد محصولات الزامی است"),
    (0, express_validator_1.body)("shippingAddress.province")
        .isString()
        .withMessage("استان الزامی است"),
    (0, express_validator_1.body)("shippingAddress.city")
        .isString()
        .withMessage("شهر الزامی است"),
    (0, express_validator_1.body)("shippingAddress.street")
        .isString()
        .withMessage("خیابان الزامی است"),
    (0, express_validator_1.body)("paymentMethod")
        .isString()
        .withMessage("روش پرداخت الزامی است"),
    (0, express_validator_1.body)("itemsPrice")
        .isNumeric()
        .withMessage("قیمت محصولات الزامی است"),
    (0, express_validator_1.body)("shippingPrice")
        .isNumeric()
        .withMessage("قیمت حمل و نقل الزامی است"),
    (0, express_validator_1.body)("taxPrice")
        .isNumeric()
        .withMessage("مالیات الزامی است"),
    (0, express_validator_1.body)("totalPrice")
        .isNumeric()
        .withMessage("قیمت کل الزامی است"),
    validate_request_1.validateRequest,
    __1.orderController.createOrder.bind(__1.orderController),
]);
router
    .route("/get-myorders")
    .get(order_1.default.getMyOrders, __1.orderController.getCurrentUserOrders.bind(__1.orderController));
router
    .route("/:id")
    .get([
    (0, express_validator_1.param)("id")
        .isMongoId()
        .withMessage("شناسه سفارش معتبر نیست"),
    validate_request_1.validateRequest,
    __1.orderController.getOrderById.bind(__1.orderController),
]);
router
    .route("/:id/pay")
    .patch([
    (0, express_validator_1.param)("id")
        .isMongoId()
        .withMessage("شناسه سفارش معتبر نیست"),
    validate_request_1.validateRequest,
    __1.orderController.updateOrderToPaid.bind(__1.orderController),
]);
router.use(auth_1.default.restrictTo("admin"));
router
    .route("/")
    .get(__1.orderController.getAllOrders.bind(__1.orderController));
router
    .route("/:id")
    .patch([
    (0, express_validator_1.param)("id")
        .isMongoId()
        .withMessage("شناسه سفارش معتبر نیست"),
    (0, express_validator_1.body)("orderItems[*].productId")
        .optional()
        .isMongoId()
        .withMessage("فرمت شناسه محصول معتبر نیست"),
    (0, express_validator_1.body)("orderItems[*].qty")
        .optional()
        .isInt({ min: 1 })
        .withMessage("فرمت تعداد محصولات معتبر نیست"),
    (0, express_validator_1.body)("shippingAddress.province")
        .optional()
        .isString()
        .withMessage("فرمت استان معتبر نیست"),
    (0, express_validator_1.body)("shippingAddress.city")
        .optional()
        .isString()
        .withMessage("فرمت شهر معتبر نیست"),
    (0, express_validator_1.body)("shippingAddress.street")
        .optional()
        .isString()
        .withMessage("فرمت خیابان معتبر نیست"),
    (0, express_validator_1.body)("paymentMethod")
        .optional()
        .isString()
        .withMessage("فرمت روش پرداخت معتبر نیست"),
    (0, express_validator_1.body)("itemsPrice")
        .optional()
        .isNumeric()
        .withMessage("فرمت قیمت محصولات معتبر نیست"),
    (0, express_validator_1.body)("shippingPrice")
        .optional()
        .isNumeric()
        .withMessage("فرمت قیمت حمل و نقل معتبر نیست"),
    (0, express_validator_1.body)("taxPrice")
        .optional()
        .isNumeric()
        .withMessage("فرمت مالیات معتبر نیست"),
    (0, express_validator_1.body)("totalPrice")
        .optional()
        .isNumeric()
        .withMessage("فرمت قیمت کل معتبر نیست"),
    validate_request_1.validateRequest,
    __1.orderController.updateOrder.bind(__1.orderController),
])
    .delete([
    (0, express_validator_1.param)("id")
        .isMongoId()
        .withMessage("شناسه سفارش معتبر نیست"),
    validate_request_1.validateRequest,
    __1.orderController.deleteOrder.bind(__1.orderController),
]);
router
    .route("/:id/deliver")
    .patch([
    (0, express_validator_1.param)("id")
        .isMongoId()
        .withMessage("شناسه سفارش معتبر نیست"),
    validate_request_1.validateRequest,
    __1.orderController.updateOrderToDeliver.bind(__1.orderController),
]);
