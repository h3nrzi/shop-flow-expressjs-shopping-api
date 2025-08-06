import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	markAsReadRequest,
	getValidNotificationData,
	createNotificationRequest,
	expectValidNotificationResponse,
	getInvalidObjectId,
	getNotificationByIdRequest,
} from "@/__tests__/helpers/notifications.helper";

describe("PATCH /api/notifications/mark-read/:id", () => {
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
			const res = await markAsReadRequest(notificationId);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await markAsReadRequest(notificationId, invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 400, if", () => {
		it("notification ID is not a valid ObjectId", async () => {
			const res = await markAsReadRequest("invalid-id", userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toContain("Cast to ObjectId failed");
		});

		it("user tries to mark another user's notification as read", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			// User tries to mark admin's notification as read
			const res = await markAsReadRequest(adminNotificationId, userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("شما مجاز به مشاهده این اعلان نیستید");
		});
	});

	describe("should return 404, if", () => {
		it("notification does not exist", async () => {
			const nonExistentId = getInvalidObjectId();
			const res = await markAsReadRequest(nonExistentId, userCookie);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
		});
	});

	describe("should return 200, if", () => {
		it("notification is marked as read successfully", async () => {
			// Verify notification is initially unread
			const initialRes = await getNotificationByIdRequest(notificationId, userCookie);
			expect(initialRes.body.data.notification.isRead).toBe(false);

			const res = await markAsReadRequest(notificationId, userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification).toBeDefined();

			const notification = res.body.data.notification;
			expectValidNotificationResponse(notification);
			expect(notification._id).toBe(notificationId);
			expect(notification.isRead).toBe(true);
			expect(notification.readAt).toBeDefined();
		});

		it("marking already read notification as read again", async () => {
			// Mark as read first time
			await markAsReadRequest(notificationId, userCookie);

			// Mark as read second time
			const res = await markAsReadRequest(notificationId, userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification.isRead).toBe(true);
		});

		it("returns updated notification data after marking as read", async () => {
			const res = await markAsReadRequest(notificationId, userCookie);

			expect(res.status).toBe(200);
			const notification = res.body.data.notification;

			// Verify all notification data is still present
			expectValidNotificationResponse(notification);
			expect(notification.user).toBe(user._id);
			expect(notification.isRead).toBe(true);
			expect(notification.readAt).toBeDefined();
			expect(new Date(notification.readAt)).toBeInstanceOf(Date);
		});

		it("admin can mark their own notification as read", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			const res = await markAsReadRequest(adminNotificationId, adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification.isRead).toBe(true);
			expect(res.body.data.notification.user).toBe(admin._id);
		});

		it("readAt timestamp is correctly set", async () => {
			const beforeTime = new Date();
			const res = await markAsReadRequest(notificationId, userCookie);
			const afterTime = new Date();

			expect(res.status).toBe(200);
			const readAtTime = new Date(res.body.data.notification.readAt);

			expect(readAtTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
			expect(readAtTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
		});
	});
});
