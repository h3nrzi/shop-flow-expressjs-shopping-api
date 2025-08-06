import express from "express";
import { body } from "express-validator";
import { notificationController } from "..";
import authMiddleware from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validate-request";

const router = express.Router();

/************************************************************************
 *********  @description Protect all routes to users only ***************
 ************************************************************************/
router.use(authMiddleware.protect);

router.route("/").get(notificationController.getCurrentUserNotifications.bind(notificationController));

router.route("/unread-count").get(notificationController.getUnreadCount.bind(notificationController));

router.route("/mark-all-read").patch(notificationController.markAllAsRead.bind(notificationController));

router.route("/delete-all").delete(notificationController.deleteAllNotifications.bind(notificationController));

router.route("/mark-read/:id").patch(notificationController.markAsRead.bind(notificationController));

router
	.route("/:id")
	.get([notificationController.getNotificationById.bind(notificationController)])
	.delete([notificationController.deleteNotification.bind(notificationController)]);

/************************************************************************
 *********  @description Protect all routes below to admin only **********
 ************************************************************************/
router.use(authMiddleware.restrictTo("admin"));

router
	.route("/")
	.post([
		body("user").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
		body("title").isString().isLength({ min: 1, max: 200 }).withMessage("عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد"),
		body("message").isString().isLength({ min: 1, max: 1000 }).withMessage("پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد"),
		body("type").isIn(["order", "promotion", "system", "review"]).withMessage("نوع اعلان معتبر نیست"),
		body("data").optional().isObject().withMessage("داده‌های اضافی باید از نوع آبجکت باشد"),
		validateRequest,
		notificationController.createNotification.bind(notificationController),
	]);

router
	.route("/bulk")
	.post([
		body("userIds").isArray({ min: 1 }).withMessage("لیست شناسه کاربران الزامی است"),
		body("userIds.*").isMongoId().withMessage("شناسه کاربر معتبر نیست"),
		body("title").isString().isLength({ min: 1, max: 200 }).withMessage("عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد"),
		body("message").isString().isLength({ min: 1, max: 1000 }).withMessage("پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد"),
		body("type").isIn(["order", "promotion", "system", "review"]).withMessage("نوع اعلان معتبر نیست"),
		body("data").optional().isObject().withMessage("داده‌های اضافی باید از نوع آبجکت باشد"),
		validateRequest,
		notificationController.createBulkNotifications.bind(notificationController),
	]);

export { router as notificationRouter };
