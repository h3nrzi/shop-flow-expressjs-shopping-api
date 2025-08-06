import { NotificationType } from "../infrastructure/notification.interface";

export interface CreateNotificationDto {
	user: string; // User who will receive the notification
	title: string; // Title of the notification
	message: string; // Message of the notification
	type: NotificationType; // Type of the notification (order, promotion, system, review)
	data?: any; // Additional data (e.g., orderId, productId, etc.)
}
