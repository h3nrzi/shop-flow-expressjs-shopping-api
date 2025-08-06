import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	markAllAsReadRequest,
	getValidNotificationData,
	createNotificationRequest,
	getNotificationsRequest,
	getUnreadCountRequest,
} from "@/__tests__/helpers/notifications.helper";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";

describe("PATCH /api/notifications/mark-all-read", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let admin: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("notificationuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestAdminAndGetCookie("notificationadmin");
		adminCookie = testAdmin.cookie;
		admin = testAdmin.user;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await markAllAsReadRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await markAllAsReadRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 200, if", () => {
		it("user has no notifications", async () => {
			const res = await markAllAsReadRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.message).toBe("همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند");
		});

		it("all user notifications are marked as read", async () => {
			// Create multiple notifications for the user
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Verify notifications are initially unread
			const beforeRes = await getUnreadCountRequest(userCookie);
			expect(beforeRes.body.data.unreadCount).toBe(3);

			const res = await markAllAsReadRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.message).toBe("همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند");

			// Verify all notifications are now read
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("only current user's notifications are marked as read", async () => {
			// Create notifications for both users
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(admin._id), adminCookie);

			// Mark all user notifications as read
			const res = await markAllAsReadRequest(userCookie);

			expect(res.status).toBe(200);

			// Verify user's notifications are read but admin's are not
			const userUnreadRes = await getUnreadCountRequest(userCookie);
			const adminUnreadRes = await getUnreadCountRequest(adminCookie);

			expect(userUnreadRes.body.data.unreadCount).toBe(0);
			expect(adminUnreadRes.body.data.unreadCount).toBe(1);
		});

		it("notifications status is correctly updated in database", async () => {
			// Create notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Mark all as read
			await markAllAsReadRequest(userCookie);

			// Fetch notifications and verify they are marked as read
			const notificationsRes = await getNotificationsRequest(userCookie);
			const notifications = notificationsRes.body.data.notifications;

			expect(notifications).toHaveLength(2);
			notifications.forEach((notification: any) => {
				expect(notification.isRead).toBe(true);
				expect(notification.readAt).toBeDefined();
			});
		});

		it("already read notifications remain read", async () => {
			// Create notifications
			const createRes1 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Mark one notification as read manually
			const { markAsReadRequest } = await import("@/__tests__/helpers/notifications.helper");
			await markAsReadRequest(createRes1.body.data.notification._id, userCookie);

			// Verify one read, one unread
			const beforeRes = await getUnreadCountRequest(userCookie);
			expect(beforeRes.body.data.unreadCount).toBe(1);

			// Mark all as read
			const res = await markAllAsReadRequest(userCookie);

			expect(res.status).toBe(200);

			// Verify all are now read
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("works when user has mix of different notification types", async () => {
			// Create notifications of different types
			const systemNotification = { ...getValidNotificationData(user._id), type: "system" as NotificationType };
			const orderNotification = { ...getValidNotificationData(user._id), type: "order" as NotificationType };
			const promotionNotification = { ...getValidNotificationData(user._id), type: "promotion" as NotificationType };
			const reviewNotification = { ...getValidNotificationData(user._id), type: "review" as NotificationType };

			await createNotificationRequest(systemNotification, adminCookie);
			await createNotificationRequest(orderNotification, adminCookie);
			await createNotificationRequest(promotionNotification, adminCookie);
			await createNotificationRequest(reviewNotification, adminCookie);

			// Verify all are unread
			const beforeRes = await getUnreadCountRequest(userCookie);
			expect(beforeRes.body.data.unreadCount).toBe(4);

			// Mark all as read
			const res = await markAllAsReadRequest(userCookie);

			expect(res.status).toBe(200);

			// Verify all are read regardless of type
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("operation is idempotent", async () => {
			// Create notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Mark all as read first time
			const res1 = await markAllAsReadRequest(userCookie);
			expect(res1.status).toBe(200);

			// Mark all as read second time
			const res2 = await markAllAsReadRequest(userCookie);
			expect(res2.status).toBe(200);

			// Verify still all read
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});
	});
});
