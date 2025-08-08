import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	createNotificationRequest,
	createTestAdminAndGetCookie,
	createTestUserAndGetCookie,
	expectValidNotificationResponse,
	getInvalidNotificationData,
	getInvalidObjectId,
	getValidNotificationData,
} from "@/__tests__/helpers/notifications.helper";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";

describe("POST /api/notifications", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	// Note: admin is used in the beforeEach setup

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("notificationuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestAdminAndGetCookie("notificationadmin");
		adminCookie = testAdmin.cookie;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const notificationData = getValidNotificationData(user._id);
			const res = await createNotificationRequest(notificationData);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید",
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const notificationData = getValidNotificationData(user._id);
			const res = await createNotificationRequest(
				notificationData,
				invalidCookie,
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!",
			);
		});
	});

	describe("should return 403, if", () => {
		it("user is not an admin", async () => {
			const notificationData = getValidNotificationData(user._id);
			const res = await createNotificationRequest(notificationData, userCookie);

			expect(res.status).toBe(403);
			expect(res.body.errors[0].message).toBe(
				"شما مجاز به انجام این عمل نیستید",
			);
		});
	});

	describe("should return 400, if", () => {
		it.each(getInvalidNotificationData())(
			"$testCase",
			async ({ data, expectedError }) => {
				const res = await createNotificationRequest(data as any, adminCookie);

				expect(res.status).toBe(400);
				expect(res.body.errors[0].message).toBe(expectedError);
			},
		);

		it("user does not exist", async () => {
			const nonExistentUserId = getInvalidObjectId();
			const notificationData = getValidNotificationData(nonExistentUserId);
			const res = await createNotificationRequest(
				notificationData,
				adminCookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("کاربر مورد نظر یافت نشد");
		});
	});

	describe("should return 201, if", () => {
		it("notification is created successfully", async () => {
			const notificationData = getValidNotificationData(user._id);
			const res = await createNotificationRequest(
				notificationData,
				adminCookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
			expect(res.body.data.notification).toBeDefined();

			const notification = res.body.data.notification;
			expectValidNotificationResponse(notification, notificationData);
			expect(notification.user).toBe(user._id);
		});

		it("notification is created with all valid notification types", async () => {
			const types: NotificationType[] = [
				"order",
				"promotion",
				"system",
				"review",
			];

			for (const type of types) {
				const notificationData = {
					...getValidNotificationData(user._id),
					type,
				};
				const res = await createNotificationRequest(
					notificationData,
					adminCookie,
				);

				expect(res.status).toBe(201);
				expect(res.body.data.notification.type).toBe(type);
			}
		});

		it("notification is created with optional data field", async () => {
			const customData = { orderId: "12345", amount: 100, currency: "USD" };
			const notificationData = {
				...getValidNotificationData(user._id),
				data: customData,
			};
			const res = await createNotificationRequest(
				notificationData,
				adminCookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.notification.data).toEqual(customData);
		});

		it("notification is created without optional data field", async () => {
			const { data, ...notificationDataWithoutData } = getValidNotificationData(
				user._id,
			);
			const res = await createNotificationRequest(
				notificationDataWithoutData,
				adminCookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.notification.data).toBeUndefined();
		});

		it("notification has correct default values", async () => {
			const notificationData = getValidNotificationData(user._id);
			const res = await createNotificationRequest(
				notificationData,
				adminCookie,
			);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;

			expect(notification.isRead).toBe(false);
			expect(notification.readAt).toBeNull();
			expect(notification.createdAt).toBeDefined();
			expect(notification.updatedAt).toBeDefined();
			expect(new Date(notification.createdAt)).toBeInstanceOf(Date);
			expect(new Date(notification.updatedAt)).toBeInstanceOf(Date);
		});

		it("admin can create notifications for different users", async () => {
			// Create another test user
			const anotherTestUser = await createTestUserAndGetCookie("anotheruser");

			const userNotification = getValidNotificationData(user._id);
			const anotherUserNotification = getValidNotificationData(
				anotherTestUser.user._id,
			);

			const userRes = await createNotificationRequest(
				userNotification,
				adminCookie,
			);
			const anotherUserRes = await createNotificationRequest(
				anotherUserNotification,
				adminCookie,
			);

			expect(userRes.status).toBe(201);
			expect(anotherUserRes.status).toBe(201);
			expect(userRes.body.data.notification.user).toBe(user._id);
			expect(anotherUserRes.body.data.notification.user).toBe(
				anotherTestUser.user._id,
			);
		});

		it("notification with custom title and message", async () => {
			const customTitle = "Custom Notification Title";
			const customMessage =
				"This is a custom notification message with special characters: !@#$%";

			const notificationData = {
				...getValidNotificationData(user._id),
				title: customTitle,
				message: customMessage,
			};

			const res = await createNotificationRequest(
				notificationData,
				adminCookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.notification.title).toBe(customTitle);
			expect(res.body.data.notification.message).toBe(customMessage);
		});
	});
});
