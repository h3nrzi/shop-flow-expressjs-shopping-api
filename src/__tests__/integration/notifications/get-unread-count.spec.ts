import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	getUnreadCountRequest,
	getValidNotificationData,
	createNotificationRequest,
	markAsReadRequest,
} from "@/__tests__/helpers/notifications.helper";

describe("GET /api/notifications/unread-count", () => {
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
			const res = await getUnreadCountRequest();

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getUnreadCountRequest(invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 200, if", () => {
		it("user has no notifications", async () => {
			const res = await getUnreadCountRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.unreadCount).toBe(0);
		});

		it("user has all unread notifications", async () => {
			// Create multiple notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			const res = await getUnreadCountRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.unreadCount).toBe(3);
		});

		it("user has some read and some unread notifications", async () => {
			// Create notifications
			const createRes1 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			const createRes2 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Mark two notifications as read
			await markAsReadRequest(createRes1.body.data.notification._id, userCookie);
			await markAsReadRequest(createRes2.body.data.notification._id, userCookie);

			const res = await getUnreadCountRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.unreadCount).toBe(1);
		});

		it("user has all read notifications", async () => {
			// Create notifications
			const createRes1 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			const createRes2 = await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Mark all notifications as read
			await markAsReadRequest(createRes1.body.data.notification._id, userCookie);
			await markAsReadRequest(createRes2.body.data.notification._id, userCookie);

			const res = await getUnreadCountRequest(userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.unreadCount).toBe(0);
		});

		it("unread count only includes current user's notifications", async () => {
			// Create notifications for both user and admin
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(admin._id), adminCookie);

			const userRes = await getUnreadCountRequest(userCookie);
			const adminRes = await getUnreadCountRequest(adminCookie);

			expect(userRes.status).toBe(200);
			expect(userRes.body.data.unreadCount).toBe(2);

			expect(adminRes.status).toBe(200);
			expect(adminRes.body.data.unreadCount).toBe(1);
		});
	});
});
