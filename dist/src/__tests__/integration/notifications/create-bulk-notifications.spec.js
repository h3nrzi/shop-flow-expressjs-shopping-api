"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const notifications_helper_1 = require("@/__tests__/helpers/notifications.helper");
describe("POST /api/notifications/bulk", () => {
    let userCookie;
    let adminCookie;
    let user;
    let admin;
    let anotherUser;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("notificationuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, notifications_helper_1.createTestAdminAndGetCookie)("notificationadmin");
        adminCookie = testAdmin.cookie;
        admin = testAdmin.user;
        const anotherTestUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("anothernotificationuser");
        anotherUser = anotherTestUser.user;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 403, if", () => {
        it("user is not an admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, userCookie);
            expect(res.status).toBe(403);
            expect(res.body.errors[0].message).toBe("شما مجاز به انجام این عمل نیستید");
        }));
    });
    describe("should return 400, if", () => {
        it.each((0, notifications_helper_1.getInvalidBulkNotificationData)())("$testCase", (_a) => __awaiter(void 0, [_a], void 0, function* ({ data, expectedError }) {
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(data, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe(expectedError);
        }));
        it("some users do not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentUserId = (0, notifications_helper_1.getInvalidObjectId)();
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([
                user._id,
                nonExistentUserId,
            ]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("برخی از کاربران مورد نظر یافت نشدند");
        }));
        it("duplicate user IDs are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([
                user._id,
                user._id,
                admin._id,
            ]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.data.notifications).toHaveLength(2);
        }));
    });
    describe("should return 201, if", () => {
        it("bulk notifications are created successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([
                user._id,
                admin._id,
                anotherUser._id,
            ]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.results).toBe(3);
            expect(res.body.data.notifications).toHaveLength(3);
            const notifications = res.body.data.notifications;
            const userIds = [user._id, admin._id, anotherUser._id];
            notifications.forEach((notification, index) => {
                (0, notifications_helper_1.expectValidNotificationResponse)(notification, bulkData);
                expect(userIds).toContain(notification.user);
                expect(notification.title).toBe(bulkData.title);
                expect(notification.message).toBe(bulkData.message);
                expect(notification.type).toBe(bulkData.type);
                expect(notification.data).toEqual(bulkData.data);
            });
        }));
        it("bulk notifications for single user", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([user._id]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.results).toBe(1);
            expect(res.body.data.notifications).toHaveLength(1);
            expect(res.body.data.notifications[0].user).toBe(user._id);
        }));
        it("bulk notifications with all valid notification types", () => __awaiter(void 0, void 0, void 0, function* () {
            const types = [
                "order",
                "promotion",
                "system",
                "review",
            ];
            for (const type of types) {
                const bulkData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id])), { type });
                const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
                expect(res.status).toBe(201);
                expect(res.body.data.notifications).toHaveLength(2);
                res.body.data.notifications.forEach((notification) => {
                    expect(notification.type).toBe(type);
                });
            }
        }));
        it("bulk notifications with optional data field", () => __awaiter(void 0, void 0, void 0, function* () {
            const customData = {
                promotionId: "promo123",
                discount: 25,
                validUntil: "2024-12-31",
            };
            const bulkData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id])), { data: customData });
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            res.body.data.notifications.forEach((notification) => {
                expect(notification.data).toEqual(customData);
            });
        }));
        it("bulk notifications without optional data field", () => __awaiter(void 0, void 0, void 0, function* () {
            const _a = (0, notifications_helper_1.getValidBulkNotificationData)([
                user._id,
                admin._id,
            ]), { data } = _a, bulkDataWithoutData = __rest(_a, ["data"]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkDataWithoutData, adminCookie);
            expect(res.status).toBe(201);
            res.body.data.notifications.forEach((notification) => {
                expect(notification.data).toBeUndefined();
            });
        }));
        it("notifications are created for each user correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = {
                userIds: [user._id, admin._id, anotherUser._id],
                title: "Bulk Test Notification",
                message: "This is a bulk notification for testing",
                type: "system",
                data: { test: true },
            };
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            const userNotifications = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            const adminNotifications = yield (0, notifications_helper_1.getNotificationsRequest)(adminCookie);
            const userNewNotification = userNotifications.body.data.notifications.find((n) => n.title === bulkData.title);
            const adminNewNotification = adminNotifications.body.data.notifications.find((n) => n.title === bulkData.title);
            expect(userNewNotification).toBeDefined();
            expect(adminNewNotification).toBeDefined();
            expect(userNewNotification.user).toBe(user._id);
            expect(adminNewNotification.user).toBe(admin._id);
        }));
        it("bulk notifications have correct default values", () => __awaiter(void 0, void 0, void 0, function* () {
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id]);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            res.body.data.notifications.forEach((notification) => {
                expect(notification.isRead).toBe(false);
                expect(notification.readAt).toBeNull();
                expect(notification.createdAt).toBeDefined();
                expect(notification.updatedAt).toBeDefined();
                expect(new Date(notification.createdAt)).toBeInstanceOf(Date);
                expect(new Date(notification.updatedAt)).toBeInstanceOf(Date);
            });
        }));
        it("bulk notifications with custom title and message", () => __awaiter(void 0, void 0, void 0, function* () {
            const customTitle = "Special Bulk Notification";
            const customMessage = "This is a special bulk notification with emojis 🎉📢";
            const bulkData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidBulkNotificationData)([user._id, admin._id])), { title: customTitle, message: customMessage });
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            res.body.data.notifications.forEach((notification) => {
                expect(notification.title).toBe(customTitle);
                expect(notification.message).toBe(customMessage);
            });
        }));
        it("large bulk notification creation", () => __awaiter(void 0, void 0, void 0, function* () {
            const testUsers = [];
            for (let i = 0; i < 5; i++) {
                const testUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)(`bulkuser${i}`);
                testUsers.push(testUser.user);
            }
            const userIds = testUsers.map((u) => u._id);
            const bulkData = (0, notifications_helper_1.getValidBulkNotificationData)(userIds);
            const res = yield (0, notifications_helper_1.createBulkNotificationsRequest)(bulkData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.results).toBe(5);
            expect(res.body.data.notifications).toHaveLength(5);
            const createdUserIds = res.body.data.notifications.map((n) => n.user);
            userIds.forEach((userId) => {
                expect(createdUserIds).toContain(userId);
            });
        }));
    });
});
