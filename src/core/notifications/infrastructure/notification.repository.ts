import { CreateNotificationDto } from "../presentation/notification.dto";
import { INotificationDoc, INotificationModel } from "./notification.interface";

export class NotificationRepository {
	constructor(private readonly notificationModel: INotificationModel) {}

	async findAllForUser(userId: string): Promise<INotificationDoc[]> {
		return this.notificationModel
			.find({
				user: userId,
			})
			.populate("user", "name email")
			.exec();
	}

	async findById(id: string): Promise<INotificationDoc | null> {
		return this.notificationModel.findById(id).populate("user", "name email");
	}

	async create(notification: CreateNotificationDto): Promise<INotificationDoc> {
		return this.notificationModel.create(notification);
	}

	async createMany(notifications: CreateNotificationDto[]): Promise<INotificationDoc[]> {
		const createdNotifications = await this.notificationModel.insertMany(notifications);
		return createdNotifications.map((notification) => notification.toObject());
	}

	async markAsRead(notificationId: string): Promise<INotificationDoc | null> {
		return this.notificationModel
			.findByIdAndUpdate(
				notificationId,
				{
					$set: {
						isRead: true,
						readAt: new Date(),
					},
				},
				{ new: true }
			)
			.populate("user", "name email");
	}

	async markAllAsReadForUser(userId: string): Promise<void> {
		await this.notificationModel.updateMany(
			{
				user: userId,
				isRead: false,
			},
			{
				$set: {
					isRead: true,
					readAt: new Date(),
				},
			}
		);
	}

	async findUnreadCountForUser(userId: string): Promise<number> {
		return this.notificationModel.countDocuments({
			user: userId,
			isRead: false,
		});
	}

	async delete(notificationId: string): Promise<void> {
		await this.notificationModel.findByIdAndDelete(notificationId);
	}

	async deleteAllForUser(userId: string): Promise<void> {
		await this.notificationModel.deleteMany({ user: userId });
	}
}
