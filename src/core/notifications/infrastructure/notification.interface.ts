import mongoose, { Document, Model } from "mongoose";
import { IUserDoc } from "../../users/user.interface";

export type NotificationType = "order" | "promotion" | "system" | "review";

export interface INotificationDoc extends Document {
	id: string; // Notification ID
	user: mongoose.Types.ObjectId | IUserDoc; // User who will receive the notification
	title: string; // Title of the notification
	message: string; // Message of the notification
	type: NotificationType; // Type of the notification
	isRead: boolean; // Whether the notification has been read
	data?: any; // Additional data (e.g., orderId, productId, etc.)
	createdAt: Date; // Date when notification was created
	readAt?: Date; // Date when notification was read (if read)
}

export interface INotificationModel extends Model<INotificationDoc> {}

export interface INotificationQuery {
	// Query filters
	user?: string;
	type?: NotificationType;
	isRead?: boolean;

	// Pagination
	page?: number;
	limit?: number;

	// Date filters
	from?: Date;
	to?: Date;

	// Sort
	sort?: "asc" | "desc";
}
