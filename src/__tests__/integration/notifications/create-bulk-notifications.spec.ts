import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import { NotificationType } from "@/core/notifications/infrastructure/notification.interface";
import {
	createTestUserAndGetCookie,
	createTestAdminAndGetCookie,
	createBulkNotificationsRequest,
	getValidBulkNotificationData,
	getInvalidBulkNotificationData,
	expectValidNotificationResponse,
	getNotificationsRequest,
	getInvalidObjectId,
} from "@/__tests__/helpers/notifications.helper";

describe("POST /api/notifications/bulk", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let admin: any;
	let anotherUser: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("notificationuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestAdminAndGetCookie("notificationadmin");
		adminCookie = testAdmin.cookie;
		admin = testAdmin.user;

		// Create another test user for bulk operations
		const anotherTestUser = await createTestUserAndGetCookie("anothernotificationuser");
		anotherUser = anotherTestUser.user;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const bulkData = getValidBulkNotificationData([user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkData);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const bulkData = getValidBulkNotificationData([user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkData, invalidCookie);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
		});
	});

	describe("should return 403, if", () => {
		it("user is not an admin", async () => {
			const bulkData = getValidBulkNotificationData([user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkData, userCookie);

			expect(res.status).toBe(403);
			expect(res.body.errors[0].message).toBe("شما مجاز به انجام این عمل نیستید");
		});
	});

	describe("should return 400, if", () => {
		it.each(getInvalidBulkNotificationData())("$testCase", async ({ data, expectedError }) => {
			const res = await createBulkNotificationsRequest(data as any, adminCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe(expectedError);
		});

		it("some users do not exist", async () => {
			const nonExistentUserId = getInvalidObjectId();
			const bulkData = getValidBulkNotificationData([user._id, nonExistentUserId]);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("برخی از کاربران مورد نظر یافت نشدند");
		});

		it("duplicate user IDs are provided", async () => {
			const bulkData = getValidBulkNotificationData([user._id, user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201); // Should still work but create notifications for unique users
			expect(res.body.data.notifications).toHaveLength(2); // Only 2 unique users
		});
	});

	describe("should return 201, if", () => {
		it("bulk notifications are created successfully", async () => {
			const bulkData = getValidBulkNotificationData([user._id, admin._id, anotherUser._id]);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
			expect(res.body.results).toBe(3);
			expect(res.body.data.notifications).toHaveLength(3);

			// Verify each notification
			const notifications = res.body.data.notifications;
			const userIds = [user._id, admin._id, anotherUser._id];

			notifications.forEach((notification: any, index: number) => {
				expectValidNotificationResponse(notification, bulkData);
				expect(userIds).toContain(notification.user);
				expect(notification.title).toBe(bulkData.title);
				expect(notification.message).toBe(bulkData.message);
				expect(notification.type).toBe(bulkData.type);
				expect(notification.data).toEqual(bulkData.data);
			});
		});

		it("bulk notifications for single user", async () => {
			const bulkData = getValidBulkNotificationData([user._id]);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			expect(res.body.results).toBe(1);
			expect(res.body.data.notifications).toHaveLength(1);
			expect(res.body.data.notifications[0].user).toBe(user._id);
		});

		it("bulk notifications with all valid notification types", async () => {
			const types: NotificationType[] = ["order", "promotion", "system", "review"];

			for (const type of types) {
				const bulkData = { ...getValidBulkNotificationData([user._id, admin._id]), type };
				const res = await createBulkNotificationsRequest(bulkData, adminCookie);

				expect(res.status).toBe(201);
				expect(res.body.data.notifications).toHaveLength(2);
				res.body.data.notifications.forEach((notification: any) => {
					expect(notification.type).toBe(type);
				});
			}
		});

		it("bulk notifications with optional data field", async () => {
			const customData = { promotionId: "promo123", discount: 25, validUntil: "2024-12-31" };
			const bulkData = { ...getValidBulkNotificationData([user._id, admin._id]), data: customData };
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			res.body.data.notifications.forEach((notification: any) => {
				expect(notification.data).toEqual(customData);
			});
		});

		it("bulk notifications without optional data field", async () => {
			const { data, ...bulkDataWithoutData } = getValidBulkNotificationData([user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkDataWithoutData, adminCookie);

			expect(res.status).toBe(201);
			res.body.data.notifications.forEach((notification: any) => {
				expect(notification.data).toBeUndefined();
			});
		});

		it("notifications are created for each user correctly", async () => {
			const bulkData = {
				userIds: [user._id, admin._id, anotherUser._id],
				title: "Bulk Test Notification",
				message: "This is a bulk notification for testing",
				type: "system" as const,
				data: { test: true },
			};

			const res = await createBulkNotificationsRequest(bulkData, adminCookie);
			expect(res.status).toBe(201);

			// Verify that each user received their notification by checking their individual notification lists
			const userNotifications = await getNotificationsRequest(userCookie);
			const adminNotifications = await getNotificationsRequest(adminCookie);

			// Find the newly created notifications
			const userNewNotification = userNotifications.body.data.notifications.find((n: any) => n.title === bulkData.title);
			const adminNewNotification = adminNotifications.body.data.notifications.find((n: any) => n.title === bulkData.title);

			expect(userNewNotification).toBeDefined();
			expect(adminNewNotification).toBeDefined();
			expect(userNewNotification.user).toBe(user._id);
			expect(adminNewNotification.user).toBe(admin._id);
		});

		it("bulk notifications have correct default values", async () => {
			const bulkData = getValidBulkNotificationData([user._id, admin._id]);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			res.body.data.notifications.forEach((notification: any) => {
				expect(notification.isRead).toBe(false);
				expect(notification.readAt).toBeNull();
				expect(notification.createdAt).toBeDefined();
				expect(notification.updatedAt).toBeDefined();
				expect(new Date(notification.createdAt)).toBeInstanceOf(Date);
				expect(new Date(notification.updatedAt)).toBeInstanceOf(Date);
			});
		});

		it("bulk notifications with custom title and message", async () => {
			const customTitle = "Special Bulk Notification";
			const customMessage = "This is a special bulk notification with emojis 🎉📢";

			const bulkData = {
				...getValidBulkNotificationData([user._id, admin._id]),
				title: customTitle,
				message: customMessage,
			};

			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			res.body.data.notifications.forEach((notification: any) => {
				expect(notification.title).toBe(customTitle);
				expect(notification.message).toBe(customMessage);
			});
		});

		it("large bulk notification creation", async () => {
			// Create 5 test users for a larger bulk operation
			const testUsers = [];
			for (let i = 0; i < 5; i++) {
				const testUser = await createTestUserAndGetCookie(`bulkuser${i}`);
				testUsers.push(testUser.user);
			}

			const userIds = testUsers.map((u) => u._id);
			const bulkData = getValidBulkNotificationData(userIds);
			const res = await createBulkNotificationsRequest(bulkData, adminCookie);

			expect(res.status).toBe(201);
			expect(res.body.results).toBe(5);
			expect(res.body.data.notifications).toHaveLength(5);

			// Verify all users received their notifications
			const createdUserIds = res.body.data.notifications.map((n: any) => n.user);
			userIds.forEach((userId) => {
				expect(createdUserIds).toContain(userId);
			});
		});
	});
});
