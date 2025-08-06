"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const __1 = require("..");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validate_request_1 = require("../../middlewares/validate-request");
const router = express_1.default.Router();
exports.notificationRouter = router;
router.use(auth_1.default.protect);
router.route("/").get(__1.notificationController.getCurrentUserNotifications.bind(__1.notificationController));
router.route("/unread-count").get(__1.notificationController.getUnreadCount.bind(__1.notificationController));
router.route("/mark-all-read").patch(__1.notificationController.markAllAsRead.bind(__1.notificationController));
router.route("/delete-all").delete(__1.notificationController.deleteAllNotifications.bind(__1.notificationController));
router.route("/mark-read/:id").patch(__1.notificationController.markAsRead.bind(__1.notificationController));
router
    .route("/:id")
    .get([__1.notificationController.getNotificationById.bind(__1.notificationController)])
    .delete([__1.notificationController.deleteNotification.bind(__1.notificationController)]);
router.use(auth_1.default.restrictTo("admin"));
router
    .route("/")
    .post([
    (0, express_validator_1.body)("user").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
    (0, express_validator_1.body)("title").isString().isLength({ min: 1, max: 200 }).withMessage("عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد"),
    (0, express_validator_1.body)("message").isString().isLength({ min: 1, max: 1000 }).withMessage("پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد"),
    (0, express_validator_1.body)("type").isIn(["order", "promotion", "system", "review"]).withMessage("نوع اعلان معتبر نیست"),
    (0, express_validator_1.body)("data").optional().isObject().withMessage("داده‌های اضافی باید از نوع آبجکت باشد"),
    validate_request_1.validateRequest,
    __1.notificationController.createNotification.bind(__1.notificationController),
]);
router
    .route("/bulk")
    .post([
    (0, express_validator_1.body)("userIds").isArray({ min: 1 }).withMessage("لیست شناسه کاربران الزامی است"),
    (0, express_validator_1.body)("userIds.*").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
    (0, express_validator_1.body)("title").isString().isLength({ min: 1, max: 200 }).withMessage("عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد"),
    (0, express_validator_1.body)("message").isString().isLength({ min: 1, max: 1000 }).withMessage("پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد"),
    (0, express_validator_1.body)("type").isIn(["order", "promotion", "system", "review"]).withMessage("نوع اعلان معتبر نیست"),
    (0, express_validator_1.body)("data").optional().isObject().withMessage("داده‌های اضافی باید از نوع آبجکت باشد"),
    validate_request_1.validateRequest,
    __1.notificationController.createBulkNotifications.bind(__1.notificationController),
]);
