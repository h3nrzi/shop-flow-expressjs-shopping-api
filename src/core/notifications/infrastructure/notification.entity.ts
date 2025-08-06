import mongoose from "mongoose";
import { INotificationDoc, INotificationModel } from "./notification.interface";

const NotificationSchema = new mongoose.Schema<INotificationDoc>(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who will receive the notification
		title: { type: String, required: true }, // Title of the notification
		message: { type: String, required: true }, // Message of the notification
		type: { type: String, enum: ["order", "promotion", "system", "review"], required: true }, // Type of the notification
		isRead: { type: Boolean, default: false }, // Whether the notification has been read
		data: { type: mongoose.Schema.Types.Mixed }, // Additional data (e.g., orderId, productId, etc.)
		readAt: { type: Date }, // Date when notification was read (if read)
		createdAt: { type: Date, default: Date.now }, // Date when notification was created
	},
	{
		toJSON: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
		toObject: {
			transform: (doc, ret) => {
				ret.id = ret._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	}
);

// Notification Model
const Notification = mongoose.model<INotificationDoc, INotificationModel>("Notification", NotificationSchema);

export { INotificationDoc, Notification };
