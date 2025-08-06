import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	deleteNotificationRequest,
	getValidNotificationData,
	createNotificationRequest,
	getInvalidObjectId,
	getNotificationByIdRequest,
	getNotificationsRequest,
} from "@/__tests__/helpers/notifications.helper";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";
import { CreateNotificationDto } from "@/core/notifications/presentation/notification.dto";

describe("DELETE /api/notifications/:id", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let admin: any;
	let notificationId: string;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("notificationuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestAdminAndGetCookie("notificationadmin");
		adminCookie = testAdmin.cookie;
		admin = testAdmin.user;

		// Create a test notification for the user
		const notificationData = getValidNotificationData(user._id);
		const createRes = await createNotificationRequest(notificationData, adminCookie);
		notificationId = createRes.body.data.notification._id;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await deleteNotificationRequest(notificationId);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await deleteNotificationRequest(notificationId, invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 400, if", () => {
		it("notification ID is not a valid ObjectId", async () => {
			const res = await deleteNotificationRequest("invalid-id", userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toContain("Cast to ObjectId failed");
		});

		it("user tries to delete another user's notification", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			// User tries to delete admin's notification
			const res = await deleteNotificationRequest(adminNotificationId, userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("شما مجاز به مشاهده این اعلان نیستید");
		});
	});

	describe("should return 404, if", () => {
		it("notification does not exist", async () => {
			const nonExistentId = getInvalidObjectId();
			const res = await deleteNotificationRequest(nonExistentId, userCookie);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
		});
	});

	describe("should return 204, if", () => {
		it("notification is deleted successfully", async () => {
			// Verify notification exists before deletion
			const beforeRes = await getNotificationByIdRequest(notificationId, userCookie);
			expect(beforeRes.status).toBe(200);

			const res = await deleteNotificationRequest(notificationId, userCookie);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");

			// Verify notification no longer exists
			const afterRes = await getNotificationByIdRequest(notificationId, userCookie);
			expect(afterRes.status).toBe(404);
		});

		it("notification is completely removed from database", async () => {
			// Create multiple notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			const createRes2 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Verify user has 3 notifications total
			const beforeRes = await getNotificationsRequest(userCookie);
			expect(beforeRes.body.data.notifications).toHaveLength(3);

			// Delete one notification
			await deleteNotificationRequest(notificationId, userCookie);

			// Verify user now has 2 notifications
			const afterRes = await getNotificationsRequest(userCookie);
			expect(afterRes.body.data.notifications).toHaveLength(2);
			expect(afterRes.body.data.totalCount).toBe(2);

			// Verify the correct notification was deleted
			const remainingIds = afterRes.body.data.notifications.map((n: any) => n._id);
			expect(remainingIds).not.toContain(notificationId);
			expect(remainingIds).toContain(createRes2.body.data.notification._id);
		});

		it("deleting read notification works correctly", async () => {
			// Mark notification as read first
			const { markAsReadRequest } = await import("@/__tests__/helpers/notifications.helper");
			await markAsReadRequest(notificationId, userCookie);

			// Verify notification is read
			const readRes = await getNotificationByIdRequest(notificationId, userCookie);
			expect(readRes.body.data.notification.isRead).toBe(true);

			// Delete the read notification
			const res = await deleteNotificationRequest(notificationId, userCookie);

			expect(res.status).toBe(204);

			// Verify it's deleted
			const afterRes = await getNotificationByIdRequest(notificationId, userCookie);
			expect(afterRes.status).toBe(404);
		});

		it("admin can delete their own notification", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			const res = await deleteNotificationRequest(adminNotificationId, adminCookie);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");

			// Verify notification is deleted
			const afterRes = await getNotificationByIdRequest(adminNotificationId, adminCookie);
			expect(afterRes.status).toBe(404);
		});

		it("deleting notification updates unread count correctly", async () => {
			// Create additional unread notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Verify initial unread count
			const { getUnreadCountRequest } = await import("@/__tests__/helpers/notifications.helper");
			const beforeRes = await getUnreadCountRequest(userCookie);
			expect(beforeRes.body.data.unreadCount).toBe(3);

			// Delete one unread notification
			await deleteNotificationRequest(notificationId, userCookie);

			// Verify unread count decreased
			const afterRes = await getUnreadCountRequest(userCookie);
			expect(afterRes.body.data.unreadCount).toBe(2);
		});

		it("deleting notification with custom data works correctly", async () => {
			// Create notification with custom data
			const customData: CreateNotificationDto = {
				user: user._id,
				title: "Custom Notification",
				message: "Custom message",
				type: "order" as NotificationType,
				data: { orderId: "12345", customField: "test" },
			};

			const customCreateRes = await createNotificationRequest(customData, adminCookie);
			const customNotificationId = customCreateRes.body.data.notification._id;

			const res = await deleteNotificationRequest(customNotificationId, userCookie);

			expect(res.status).toBe(204);

			// Verify it's deleted
			const afterRes = await getNotificationByIdRequest(customNotificationId, userCookie);
			expect(afterRes.status).toBe(404);
		});
	});

	describe("should be idempotent", () => {
		it("deleting already deleted notification returns 404", async () => {
			// Delete notification first time
			const res1 = await deleteNotificationRequest(notificationId, userCookie);
			expect(res1.status).toBe(204);

			// Try to delete again
			const res2 = await deleteNotificationRequest(notificationId, userCookie);
			expect(res2.status).toBe(404);
			expect(res2.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
		});
	});
});
