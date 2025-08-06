import {
	createNotificationRequest,
	createTestAdminAndGetCookie,
	createTestUserAndGetCookie,
	deleteNotificationRequest,
	expectValidNotificationResponse,
	getNotificationsRequest,
	getUnreadCountRequest,
	getValidNotificationData,
	markAsReadRequest,
} from "@/__tests__/helpers/notifications.helper";

describe("Notification Edge Cases", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("notificationuser");
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestAdminAndGetCookie("notificationadmin");
		adminCookie = testAdmin.cookie;
	});

	describe("Notification Lifecycle Edge Cases", () => {
		it("should handle rapid successive operations on the same notification", async () => {
			// Create notification
			const notificationData = getValidNotificationData(user._id);
			const createRes = await createNotificationRequest(notificationData, adminCookie);
			const notificationId = createRes.body.data.notification._id;

			// Perform rapid successive operations
			const markReadPromise = markAsReadRequest(notificationId, userCookie);
			const getNotificationPromise = require("@/__tests__/helpers/notifications.helper").getNotificationByIdRequest(notificationId, userCookie);

			const [markReadRes, getRes] = await Promise.all([markReadPromise, getNotificationPromise]);

			// Both operations should succeed
			expect(markReadRes.status).toBe(200);
			expect(getRes.status).toBe(200);
		});

		it("should handle marking notification as read multiple times concurrently", async () => {
			// Create notification
			const notificationData = getValidNotificationData(user._id);
			const createRes = await createNotificationRequest(notificationData, adminCookie);
			const notificationId = createRes.body.data.notification._id;

			// Mark as read multiple times concurrently
			const promises = Array(3)
				.fill(null)
				.map(() => markAsReadRequest(notificationId, userCookie));
			const results = await Promise.all(promises);

			// All should succeed
			results.forEach((res) => {
				expect(res.status).toBe(200);
				expect(res.body.data.notification.isRead).toBe(true);
			});
		});

		it("should handle deleting a notification while it's being marked as read", async () => {
			// Create notification
			const notificationData = getValidNotificationData(user._id);
			const createRes = await createNotificationRequest(notificationData, adminCookie);
			const notificationId = createRes.body.data.notification._id;

			// Try to mark as read and delete concurrently
			const markReadPromise = markAsReadRequest(notificationId, userCookie);
			const deletePromise = deleteNotificationRequest(notificationId, userCookie);

			const results = await Promise.allSettled([markReadPromise, deletePromise]);

			// At least one should succeed, the other might fail due to race condition
			const successCount = results.filter((result) => result.status === "fulfilled" && result.value.status < 400).length;

			expect(successCount).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Large Data Handling", () => {
		it("should handle notification with large data payload", async () => {
			// Create a large data object
			const largeData = {
				orders: Array(100)
					.fill(null)
					.map((_, i) => ({
						id: `order-${i}`,
						product: `product-${i}`,
						price: Math.floor(Math.random() * 1000),
						description: `This is a description for order ${i}`.repeat(10),
					})),
				metadata: {
					timestamp: Date.now(),
					source: "bulk-operation",
					tags: Array(50)
						.fill(null)
						.map((_, i) => `tag-${i}`),
					details: "Very long description that contains a lot of information about this notification".repeat(20),
				},
			};

			const notificationData = {
				...getValidNotificationData(user._id),
				data: largeData,
			};

			const res = await createNotificationRequest(notificationData, adminCookie);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;
			expectValidNotificationResponse(notification, notificationData);
			expect(notification.data).toEqual(largeData);
		});

		it("should handle creating many notifications for a single user", async () => {
			// Create 20 notifications for the same user
			const promises = Array(20)
				.fill(null)
				.map((_, i) => {
					const notificationData = {
						...getValidNotificationData(user._id),
						title: `Notification ${i + 1}`,
						message: `This is notification number ${i + 1}`,
					};
					return createNotificationRequest(notificationData, adminCookie);
				});

			const results = await Promise.all(promises);

			// All should succeed
			results.forEach((res, index) => {
				expect(res.status).toBe(201);
				expect(res.body.data.notification.title).toBe(`Notification ${index + 1}`);
			});

			// Verify user sees all notifications
			const userNotificationsRes = await getNotificationsRequest(userCookie);
			expect(userNotificationsRes.body.data.notifications).toHaveLength(20);
			expect(userNotificationsRes.body.data.unreadCount).toBe(20);
		});
	});

	describe("Special Characters and Encoding", () => {
		it("should handle notifications with special characters and emojis", async () => {
			const specialCharsData = {
				...getValidNotificationData(user._id),
				title: "Special: ñáéíóú çñ 中文 العربية 🎉🚀💡",
				message: "Message with special chars: @#$%^&*()_+-=[]{}|;':\",./<>? and emojis 😀🎊🌟🔥💯",
			};

			const res = await createNotificationRequest(specialCharsData, adminCookie);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;
			expect(notification.title).toBe(specialCharsData.title);
			expect(notification.message).toBe(specialCharsData.message);
		});

		it("should handle notifications with HTML-like content", async () => {
			const htmlLikeData = {
				...getValidNotificationData(user._id),
				title: "<div>HTML Title</div>",
				message: "<script>alert('xss')</script><p>This looks like HTML but should be treated as text</p>",
			};

			const res = await createNotificationRequest(htmlLikeData, adminCookie);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;
			expect(notification.title).toBe(htmlLikeData.title);
			expect(notification.message).toBe(htmlLikeData.message);
		});

		it("should handle notifications with SQL-like content", async () => {
			const sqlLikeData = {
				...getValidNotificationData(user._id),
				title: "SQL: SELECT * FROM users;",
				message: "DROP TABLE notifications; -- This should be treated as text",
			};

			const res = await createNotificationRequest(sqlLikeData, adminCookie);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;
			expect(notification.title).toBe(sqlLikeData.title);
			expect(notification.message).toBe(sqlLikeData.message);
		});
	});

	describe("Data Consistency", () => {
		it("should maintain consistent unread count after multiple operations", async () => {
			// Create multiple notifications
			const createPromises = Array(5)
				.fill(null)
				.map(() => createNotificationRequest(getValidNotificationData(user._id), adminCookie));
			const createResults = await Promise.all(createPromises);
			const notificationIds = createResults.map((res) => res.body.data.notification._id);

			// Verify initial unread count
			let unreadRes = await getUnreadCountRequest(userCookie);
			expect(unreadRes.body.data.unreadCount).toBe(5);

			// Mark some as read
			await markAsReadRequest(notificationIds[0], userCookie);
			await markAsReadRequest(notificationIds[1], userCookie);

			// Verify unread count decreased
			unreadRes = await getUnreadCountRequest(userCookie);
			expect(unreadRes.body.data.unreadCount).toBe(3);

			// Delete one unread notification
			await deleteNotificationRequest(notificationIds[2], userCookie);

			// Verify unread count decreased again
			unreadRes = await getUnreadCountRequest(userCookie);
			expect(unreadRes.body.data.unreadCount).toBe(2);

			// Delete one read notification
			await deleteNotificationRequest(notificationIds[0], userCookie);

			// Verify unread count stayed the same
			unreadRes = await getUnreadCountRequest(userCookie);
			expect(unreadRes.body.data.unreadCount).toBe(2);
		});

		it("should handle concurrent read/unread count requests", async () => {
			// Create notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Make multiple concurrent unread count requests
			const promises = Array(5)
				.fill(null)
				.map(() => getUnreadCountRequest(userCookie));
			const results = await Promise.all(promises);

			// All should return the same count
			results.forEach((res) => {
				expect(res.status).toBe(200);
				expect(res.body.data.unreadCount).toBe(2);
			});
		});
	});

	describe("Notification Data Integrity", () => {
		it("should preserve notification data through read/unread cycle", async () => {
			const originalData = {
				...getValidNotificationData(user._id),
				title: "Data Integrity Test",
				message: "Testing data preservation",
				data: {
					orderId: "ORDER123",
					productId: "PROD456",
					metadata: { timestamp: Date.now(), version: "1.0" },
				},
			};

			const createRes = await createNotificationRequest(originalData, adminCookie);
			const notificationId = createRes.body.data.notification._id;

			// Mark as read
			const markReadRes = await markAsReadRequest(notificationId, userCookie);

			// Verify data is preserved
			const readNotification = markReadRes.body.data.notification;
			expect(readNotification.title).toBe(originalData.title);
			expect(readNotification.message).toBe(originalData.message);
			expect(readNotification.data).toEqual(originalData.data);
			expect(readNotification.type).toBe(originalData.type);
		});

		it("should handle notifications with null/undefined values in data", async () => {
			const dataWithNulls = {
				...getValidNotificationData(user._id),
				data: {
					orderId: "ORDER123",
					productId: null,
					metadata: undefined,
					emptyString: "",
					zero: 0,
					falseValue: false,
				},
			};

			const res = await createNotificationRequest(dataWithNulls, adminCookie);

			expect(res.status).toBe(201);
			const notification = res.body.data.notification;
			expect(notification.data.orderId).toBe("ORDER123");
			expect(notification.data.productId).toBeNull();
			expect(notification.data.hasOwnProperty("metadata")).toBe(false); // undefined should be removed
			expect(notification.data.emptyString).toBe("");
			expect(notification.data.zero).toBe(0);
			expect(notification.data.falseValue).toBe(false);
		});
	});

	describe("Performance Edge Cases", () => {
		it("should handle rapid notification creation and deletion", async () => {
			const operations = [];

			// Create and delete notifications rapidly
			for (let i = 0; i < 10; i++) {
				const createOp = createNotificationRequest(getValidNotificationData(user._id), adminCookie)
					.then((res) => res.body.data.notification._id)
					.then((id) => deleteNotificationRequest(id, userCookie));

				operations.push(createOp);
			}

			const results = await Promise.allSettled(operations);

			// Most operations should succeed
			const successCount = results.filter((result) => result.status === "fulfilled").length;

			expect(successCount).toBeGreaterThanOrEqual(8); // Allow some to fail due to race conditions
		});

		it("should handle concurrent notification list requests during modifications", async () => {
			// Create initial notifications
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			await createNotificationRequest(getValidNotificationData(user._id), adminCookie);

			// Start concurrent operations
			const listPromises = Array(5)
				.fill(null)
				.map(() => getNotificationsRequest(userCookie));
			const createPromise = createNotificationRequest(getValidNotificationData(user._id), adminCookie);
			const countPromise = getUnreadCountRequest(userCookie);

			const results = await Promise.all([...listPromises, createPromise, countPromise]);

			// All list requests should succeed
			listPromises.forEach((_, index) => {
				expect(results[index].status).toBe(200);
			});

			// Create and count should also succeed
			expect(results[results.length - 2].status).toBe(201); // create
			expect(results[results.length - 1].status).toBe(200); // count
		});
	});

	describe("Memory and Resource Management", () => {
		it("should handle cleanup after bulk operations", async () => {
			// Create many notifications
			const promises = Array(50)
				.fill(null)
				.map(() => createNotificationRequest(getValidNotificationData(user._id), adminCookie));
			await Promise.all(promises);

			// Verify all created
			let listRes = await getNotificationsRequest(userCookie);
			expect(listRes.body.data.notifications).toHaveLength(50);

			// Bulk delete all
			const { deleteAllNotificationsRequest } = await import("@/__tests__/helpers/notifications.helper");
			const deleteRes = await deleteAllNotificationsRequest(userCookie);
			expect(deleteRes.status).toBe(204);

			// Verify all deleted
			listRes = await getNotificationsRequest(userCookie);
			expect(listRes.body.data.notifications).toHaveLength(0);
			expect(listRes.body.data.unreadCount).toBe(0);
		});
	});
});
