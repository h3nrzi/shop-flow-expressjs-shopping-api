import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	getNotificationsRequest,
	getValidNotificationData,
	createNotificationRequest,
	expectValidNotificationResponse,
} from "@/__tests__/helpers/notifications.helper";

describe("GET /api/notifications", () => {
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
			const res = await getNotificationsRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getNotificationsRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 200, if", () => {
		it("user has no notifications", async () => {
			const res = await getNotificationsRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.results).toBe(0);
			expect(res.body.data.notifications).toEqual([]);
			expect(res.body.data.totalCount).toBe(0);
			expect(res.body.data.unreadCount).toBe(0);
		});

		it("user has notifications", async () => {
			// Create a notification for the user
			const notificationData = getValidNotificationData(user._id);
			await createNotificationRequest(notificationData, adminCookie);

			const res = await getNotificationsRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.results).toBe(1);
			expect(res.body.data.notifications).toHaveLength(1);
			expect(res.body.data.totalCount).toBe(1);
			expect(res.body.data.unreadCount).toBe(1);

			const notification = res.body.data.notifications[0];
			expectValidNotificationResponse(notification, notificationData);
		});

		it("user sees only their own notifications", async () => {
			// Create notifications for both users
			const userNotification = getValidNotificationData(user._id);
			const adminNotification = getValidNotificationData(admin._id);

			await createNotificationRequest(userNotification, adminCookie);
			await createNotificationRequest(adminNotification, adminCookie);

			const userRes = await getNotificationsRequest(userCookie);
			const adminRes = await getNotificationsRequest(adminCookie);

			// User should see only their notification
			expect(userRes.status).toBe(200);
			expect(userRes.body.data.notifications).toHaveLength(1);
			expect(userRes.body.data.notifications[0].user).toBe(user._id);

			// Admin should see only their notification
			expect(adminRes.status).toBe(200);
			expect(adminRes.body.data.notifications).toHaveLength(1);
			expect(adminRes.body.data.notifications[0].user).toBe(admin._id);
		});

		it("notifications are sorted by creation date (newest first)", async () => {
			// Create multiple notifications
			const notification1 = { ...getValidNotificationData(user._id), title: "First Notification" };
			const notification2 = { ...getValidNotificationData(user._id), title: "Second Notification" };
			const notification3 = { ...getValidNotificationData(user._id), title: "Third Notification" };

			await createNotificationRequest(notification1, adminCookie);
			await createNotificationRequest(notification2, adminCookie);
			await createNotificationRequest(notification3, adminCookie);

			const res = await getNotificationsRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.notifications).toHaveLength(3);

			// Check that notifications are sorted by creation date (newest first)
			const notifications = res.body.data.notifications;
			expect(notifications[0].title).toBe("Third Notification");
			expect(notifications[1].title).toBe("Second Notification");
			expect(notifications[2].title).toBe("First Notification");

			// Verify dates are in descending order
			expect(new Date(notifications[0].createdAt).getTime()).toBeGreaterThan(new Date(notifications[1].createdAt).getTime());
			expect(new Date(notifications[1].createdAt).getTime()).toBeGreaterThan(new Date(notifications[2].createdAt).getTime());
		});

		it("unread count is calculated correctly", async () => {
			// Create multiple notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			const res = await getNotificationsRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.data.totalCount).toBe(3);
			expect(res.body.data.unreadCount).toBe(3);
		});
	});
});
