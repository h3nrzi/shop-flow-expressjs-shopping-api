import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	getNotificationByIdRequest,
	getValidNotificationData,
	createNotificationRequest,
	expectValidNotificationResponse,
	getInvalidObjectId,
} from "@/__tests__/helpers/notifications.helper";
import { CreateNotificationDto } from "@/core/notifications/presentation/notification.dto";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";

describe("GET /api/notifications/:id", () => {
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
			const res = await getNotificationByIdRequest(notificationId);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await getNotificationByIdRequest(notificationId, invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 400, if", () => {
		it("notification ID is not a valid ObjectId", async () => {
			const res = await getNotificationByIdRequest("invalid-id", userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toContain("Cast to ObjectId failed");
		});

		it("user tries to access another user's notification", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			// User tries to access admin's notification
			const res = await getNotificationByIdRequest(adminNotificationId, userCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("شما مجاز به مشاهده این اعلان نیستید");
		});
	});

	describe("should return 404, if", () => {
		it("notification does not exist", async () => {
			const nonExistentId = getInvalidObjectId();
			const res = await getNotificationByIdRequest(nonExistentId, userCookie);

			expect(res.status).toBe(404);
			expect(res.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
		});
	});

	describe("should return 200, if", () => {
		it("notification exists and belongs to the user", async () => {
			const res = await getNotificationByIdRequest(notificationId, userCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification).toBeDefined();

			const notification = res.body.data.notification;
			expectValidNotificationResponse(notification);
			expect(notification._id).toBe(notificationId);
			expect(notification.user).toBe(user._id);
		});

		it("returns correct notification data", async () => {
			const customData: CreateNotificationDto = {
				user: user._id,
				title: "Custom Test Notification",
				message: "This is a custom test message",
				type: "order" as NotificationType,
				data: { orderId: "12345", customField: "test" },
			};

			const createRes = await createNotificationRequest(customData, adminCookie);
			const customNotificationId = createRes.body.data.notification._id;

			const res = await getNotificationByIdRequest(customNotificationId, userCookie);

			expect(res.status).toBe(200);
			const notification = res.body.data.notification;
			expectValidNotificationResponse(notification, customData);
		});

		it("admin can access their own notifications", async () => {
			// Create notification for admin
			const adminNotificationData = getValidNotificationData(admin._id);
			const adminCreateRes = await createNotificationRequest(adminNotificationData, adminCookie);
			const adminNotificationId = adminCreateRes.body.data.notification._id;

			const res = await getNotificationByIdRequest(adminNotificationId, adminCookie);

			expect(res.status).toBe(200);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification.user).toBe(admin._id);
		});
	});
});
