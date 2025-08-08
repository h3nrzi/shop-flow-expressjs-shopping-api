import { BadRequestError } from "../../../errors/bad-request-error";
import { NotFoundError } from "../../../errors/not-found-error";
import {
	INotificationDoc,
	NotificationType,
} from "../infrastructure/notification.interface";
import { NotificationRepository } from "../infrastructure/notification.repository";
import { CreateNotificationDto } from "../presentation/notification.dto";

export class NotificationService {
	constructor(
		private readonly notificationRepository: NotificationRepository,
	) {}

	/******************************************************
	 ************* @description GET HANDLERS *************
	 ******************************************************/

	async getCurrentUserNotifications(userId: string): Promise<{
		notifications: INotificationDoc[];
		totalCount: number;
		unreadCount: number;
	}> {
		const notifications =
			await this.notificationRepository.findAllForUser(userId);
		const totalCount = notifications.length;
		const unreadCount =
			await this.notificationRepository.findUnreadCountForUser(userId);

		return { notifications, totalCount, unreadCount };
	}

	async getNotificationById(
		notificationId: string,
		userId: string,
	): Promise<INotificationDoc> {
		const notification =
			await this.notificationRepository.findById(notificationId);

		if (!notification) {
			throw new NotFoundError("اعلان مورد نظر یافت نشد");
		}

		// Check if notification belongs to the user
		if (notification.user.toString() !== userId) {
			throw new BadRequestError("شما مجاز به مشاهده این اعلان نیستید");
		}

		return notification;
	}

	async getUnreadCount(userId: string): Promise<number> {
		return this.notificationRepository.findUnreadCountForUser(userId);
	}

	/******************************************************
	 ************* @description POST HANDLERS *************
	 ******************************************************/

	async createNotification(
		createNotificationDto: CreateNotificationDto,
	): Promise<INotificationDoc> {
		return this.notificationRepository.create(createNotificationDto);
	}

	// Helper method to create system notifications
	async createSystemNotification(
		userId: string,
		title: string,
		message: string,
		data?: any,
	): Promise<INotificationDoc> {
		return this.createNotification({
			user: userId,
			title,
			message,
			type: "system",
			data,
		});
	}

	// Helper method to create order notifications
	async createOrderNotification(
		userId: string,
		title: string,
		message: string,
		orderId?: string,
	): Promise<INotificationDoc> {
		return this.createNotification({
			user: userId,
			title,
			message,
			type: "order",
			data: orderId ? { orderId } : undefined,
		});
	}

	// Helper method to create promotion notifications
	async createPromotionNotification(
		userId: string,
		title: string,
		message: string,
		data?: any,
	): Promise<INotificationDoc> {
		return this.createNotification({
			user: userId,
			title,
			message,
			type: "promotion",
			data,
		});
	}

	// Helper method to create review notifications
	async createReviewNotification(
		userId: string,
		title: string,
		message: string,
		data?: any,
	): Promise<INotificationDoc> {
		return this.createNotification({
			user: userId,
			title,
			message,
			type: "review",
			data,
		});
	}

	/*******************************************************
	 ************* @description PATCH HANDLERS *************
	 *******************************************************/

	async markNotificationAsRead(
		notificationId: string,
		userId: string,
	): Promise<INotificationDoc> {
		// First check if notification exists and belongs to user
		await this.getNotificationById(notificationId, userId);

		const updatedNotification =
			await this.notificationRepository.markAsRead(notificationId);

		if (!updatedNotification) {
			throw new NotFoundError("خطا در به‌روزرسانی اعلان");
		}

		return updatedNotification;
	}

	async markAllNotificationsAsReadForUser(userId: string): Promise<void> {
		await this.notificationRepository.markAllAsReadForUser(userId);
	}

	/*******************************************************
	 ************* @description DELETE HANDLERS ************
	 *******************************************************/

	async deleteNotification(
		notificationId: string,
		userId: string,
	): Promise<void> {
		// First check if notification exists and belongs to user
		await this.getNotificationById(notificationId, userId);

		await this.notificationRepository.delete(notificationId);
	}

	async deleteAllNotificationsForUser(userId: string): Promise<void> {
		await this.notificationRepository.deleteAllForUser(userId);
	}

	/******************************************************
	 ************* @description BULK OPERATIONS ***********
	 ******************************************************/

	// Send notification to multiple users
	async createBulkNotifications(
		userIds: string[],
		title: string,
		message: string,
		type: NotificationType,
		data?: any,
	): Promise<INotificationDoc[]> {
		const notifications = userIds.map((userId) => ({
			user: userId,
			title,
			message,
			type,
			data,
		}));

		return this.notificationRepository.createMany(notifications);
	}

	// Send notification to all users (for system-wide announcements)
	async createNotificationForAllUsers(
		title: string,
		message: string,
		type: NotificationType = "system",
		data?: any,
	): Promise<void> {
		// This would require user service to get all user IDs
		// For now, we'll leave this as a placeholder
		throw new BadRequestError(
			"عملیات ارسال اعلان برای همه کاربران هنوز پیاده‌سازی نشده است",
		);
	}
}
