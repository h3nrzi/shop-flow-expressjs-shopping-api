import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	deleteAllNotificationsRequest,
	getValidNotificationData,
	createNotificationRequest,
	getNotificationsRequest,
	getUnreadCountRequest,
} from "@/__tests__/helpers/notifications.helper";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";

describe("DELETE /api/notifications/delete-all", () => {
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
			const res = await deleteAllNotificationsRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await deleteAllNotificationsRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 204, if", () => {
		it("user has no notifications", async () => {
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");
		});

		it("all user notifications are deleted", async () => {
			// Create multiple notifications for the user
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);

			// Verify notifications exist before deletion
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(3);
			expect(beforeRes.body.data.totalCount).toBe(3);

			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");

			// Verify all notifications are deleted
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
			expect(afterRes.body.data.totalCount).toBe(0);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("only current user's notifications are deleted", async () => {
			// Create notifications for both users
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(admin._id),
				adminCookie,
			);

			// Verify initial state
			const userBeforeRes = await getNotificationsRequest(userCookie);
			const adminBeforeRes = await getNotificationsRequest(adminCookie);
			expect(userBeforeRes.body.data.notifications).toHaveLength(2);
			expect(adminBeforeRes.body.data.notifications).toHaveLength(1);

			// Delete all user notifications
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);

			// Verify user notifications are deleted but admin notifications remain
			const userAfterRes = await getNotificationsRequest(userCookie);
			const adminAfterRes = await getNotificationsRequest(adminCookie);

			expect(userAfterRes.body.data.notifications).toHaveLength(0);
			expect(userAfterRes.body.data.totalCount).toBe(0);
			expect(adminAfterRes.body.data.notifications).toHaveLength(1);
			expect(adminAfterRes.body.data.totalCount).toBe(1);
		});

		it("unread count is reset to zero after deletion", async () => {
			// Create multiple notifications
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);

			// Verify initial unread count
			const beforeRes = await getUnreadCountRequest(userCookie);
			expect(beforeRes.body.data.unreadCount).toBe(3);

			// Delete all notifications
			await deleteAllNotificationsRequest(userCookie);

			// Verify unread count is zero
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("deletes both read and unread notifications", async () => {
			// Create notifications
			const createRes1 = await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			const createRes2 = await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);

			// Mark some notifications as read
			const { markAsReadRequest } = await import(
				"@/__tests__/helpers/notifications.helper"
			);
			await markAsReadRequest(
				createRes1.body.data.notification._id,
				userCookie,
			);
			await markAsReadRequest(
				createRes2.body.data.notification._id,
				userCookie,
			);

			// Verify mixed read/unread state
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.totalCount).toBe(3);
			expect(beforeRes.body.data.unreadCount).toBe(1);

			// Delete all notifications
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);

			// Verify all notifications are deleted regardless of read status
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
			expect(afterRes.body.data.totalCount).toBe(0);
			expect(afterRes.body.data.unreadCount).toBe(0);
		});

		it("deletes notifications of all types", async () => {
			// Create notifications of different types
			const systemNotification = {
				...getValidNotificationData(user._id),
				type: "system" as NotificationType,
			};
			const orderNotification = {
				...getValidNotificationData(user._id),
				type: "order" as NotificationType,
			};
			const promotionNotification = {
				...getValidNotificationData(user._id),
				type: "promotion" as NotificationType,
			};
			const reviewNotification = {
				...getValidNotificationData(user._id),
				type: "review" as NotificationType,
			};

			await createNotificationRequest(systemNotification, adminCookie);
			await createNotificationRequest(orderNotification, adminCookie);
			await createNotificationRequest(promotionNotification, adminCookie);
			await createNotificationRequest(reviewNotification, adminCookie);

			// Verify all notifications exist
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(4);

			// Delete all notifications
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);

			// Verify all notifications are deleted regardless of type
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
			expect(afterRes.body.data.totalCount).toBe(0);
		});

		it("deletes notifications with custom data", async () => {
			// Create notifications with various custom data
			const notification1 = {
				...getValidNotificationData(user._id),
				data: { orderId: "12345", productId: "67890" },
			};
			const notification2 = {
				...getValidNotificationData(user._id),
				data: { promotionId: "promo123", discount: 50 },
			};

			await createNotificationRequest(notification1, adminCookie);
			await createNotificationRequest(notification2, adminCookie);

			// Verify notifications with data exist
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(2);

			// Delete all notifications
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);

			// Verify all are deleted
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
		});

		it("admin can delete all their own notifications", async () => {
			// Create notifications for admin
			await createNotificationRequest(
				getValidNotificationData(admin._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(admin._id),
				adminCookie,
			);

			// Verify admin has notifications
			const beforeRes = await getNotificationsRequest(adminCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(2);

			const res = await deleteAllNotificationsRequest(adminCookie);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");

			// Verify admin's notifications are deleted
			const afterRes = await getNotificationsRequest(adminCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
		});

		it("operation is idempotent", async () => {
			// Create notifications
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);
			await createNotificationRequest(
				getValidNotificationData(user._id),
				adminCookie,
			);

			// Delete all notifications first time
			const res1 = await deleteAllNotificationsRequest(userCookie);
			expect(res1.status).toBe(204);

			// Verify notifications are deleted
			const middleRes = await getNotificationsRequest(userCookie);
			expect(middleRes.body.data.notifications).toHaveLength(0);

			// Delete all notifications second time (should still work)
			const res2 = await deleteAllNotificationsRequest(userCookie);
			expect(res2.status).toBe(204);

			// Verify still no notifications
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
		});

		it("works correctly with large number of notifications", async () => {
			// Create many notifications
			const promises = [];
			for (let i = 0; i < 10; i++) {
				promises.push(
					createNotificationRequest(
						getValidNotificationData(user._id),
						adminCookie,
					),
				);
			}
			await Promise.all(promises);

			// Verify all notifications exist
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(10);

			// Delete all notifications
			const res = await deleteAllNotificationsRequest(userCookie);

			expect(res.status).toBe(204);

			// Verify all are deleted
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(0);
		});
	});
});
