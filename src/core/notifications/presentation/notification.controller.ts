import { Request, Response } from "express";
import { NotificationService } from "../application/notification.service";
import { CreateNotificationDto } from "./notification.dto";

export class NotificationController {
	constructor(private readonly notificationService: NotificationService) {}

	/*******************************************************
	 ****************** GET HANDLERS ************************
	 ******************************************************** */

	// Get all notifications for current user
	getCurrentUserNotifications = async (req: Request, res: Response): Promise<void> => {
		const userId = req.user.id;

		const { notifications, totalCount, unreadCount } = await this.notificationService.getCurrentUserNotifications(userId);

		res.status(200).json({
			status: "success",
			results: notifications.length,
			data: {
				notifications,
				totalCount,
				unreadCount,
			},
		});
	};

	// Get a notification byId
	getNotificationById = async (req: Request, res: Response): Promise<void> => {
		const notificationId = req.params.id;
		const userId = req.user.id;

		const notification = await this.notificationService.getNotificationById(notificationId, userId);

		res.status(200).json({
			status: "success",
			data: { notification },
		});
	};

	// Get unread notifications count for current user
	getUnreadCount = async (req: Request, res: Response): Promise<void> => {
		const userId = req.user.id;

		const unreadCount = await this.notificationService.getUnreadCount(userId);

		res.status(200).json({
			status: "success",
			data: { unreadCount },
		});
	};

	/*******************************************************
	 ****************** POST HANDLERS ***********************
	 ******************************************************** */

	// Admin only: Create a notification (for system notifications)
	createNotification = async (req: Request, res: Response): Promise<void> => {
		const createNotificationDto = req.body as CreateNotificationDto;

		const notification = await this.notificationService.createNotification(createNotificationDto);

		res.status(201).json({
			status: "success",
			data: { notification },
		});
	};

	// Admin only: Create bulk notifications
	createBulkNotifications = async (req: Request, res: Response): Promise<void> => {
		const { userIds, title, message, type, data } = req.body;

		const notifications = await this.notificationService.createBulkNotifications(userIds, title, message, type, data);

		res.status(201).json({
			status: "success",
			results: notifications.length,
			data: { notifications },
		});
	};

	/*******************************************************
	 ****************** PATCH HANDLERS **********************
	 ******************************************************** */

	// Mark a notification as read
	markAsRead = async (req: Request, res: Response): Promise<void> => {
		const notificationId = req.params.id;
		const userId = req.user.id;

		const notification = await this.notificationService.markNotificationAsRead(notificationId, userId);

		res.status(200).json({
			status: "success",
			data: { notification },
		});
	};

	// Mark all notifications as read for current user
	markAllAsRead = async (req: Request, res: Response): Promise<void> => {
		const userId = req.user.id;

		await this.notificationService.markAllNotificationsAsReadForUser(userId);

		res.status(200).json({
			status: "success",
			message: "همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند",
		});
	};

	/*******************************************************
	 ****************** DELETE HANDLERS *********************
	 ******************************************************** */

	// Delete a specific notification
	deleteNotification = async (req: Request, res: Response): Promise<void> => {
		const notificationId = req.params.id;
		const userId = req.user.id;

		await this.notificationService.deleteNotification(notificationId, userId);

		res.status(204).json({
			status: "success",
		});
	};

	// Delete all notifications for current user
	deleteAllNotifications = async (req: Request, res: Response): Promise<void> => {
		const userId = req.user.id;

		await this.notificationService.deleteAllNotificationsForUser(userId);

		res.status(204).json({
			status: "success",
		});
	};
}
