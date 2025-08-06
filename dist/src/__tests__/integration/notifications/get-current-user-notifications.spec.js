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
Object.defineProperty(exports, "__esModule", { value: true });
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const notifications_helper_1 = require("@/__tests__/helpers/notifications.helper");
describe("GET /api/notifications", () => {
    let userCookie;
    let adminCookie;
    let user;
    let admin;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("notificationuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, notifications_helper_1.createTestAdminAndGetCookie)("notificationadmin");
        adminCookie = testAdmin.cookie;
        admin = testAdmin.user;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getNotificationsRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, notifications_helper_1.getNotificationsRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 200, if", () => {
        it("user has no notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.results).toBe(0);
            expect(res.body.data.notifications).toEqual([]);
            expect(res.body.data.totalCount).toBe(0);
            expect(res.body.data.unreadCount).toBe(0);
        }));
        it("user has notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            const res = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.results).toBe(1);
            expect(res.body.data.notifications).toHaveLength(1);
            expect(res.body.data.totalCount).toBe(1);
            expect(res.body.data.unreadCount).toBe(1);
            const notification = res.body.data.notifications[0];
            (0, notifications_helper_1.expectValidNotificationResponse)(notification, notificationData);
        }));
        it("user sees only their own notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const userNotification = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const adminNotification = (0, notifications_helper_1.getValidNotificationData)(admin._id);
            yield (0, notifications_helper_1.createNotificationRequest)(userNotification, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(adminNotification, adminCookie);
            const userRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            const adminRes = yield (0, notifications_helper_1.getNotificationsRequest)(adminCookie);
            expect(userRes.status).toBe(200);
            expect(userRes.body.data.notifications).toHaveLength(1);
            expect(userRes.body.data.notifications[0].user).toBe(user._id);
            expect(adminRes.status).toBe(200);
            expect(adminRes.body.data.notifications).toHaveLength(1);
            expect(adminRes.body.data.notifications[0].user).toBe(admin._id);
        }));
        it("notifications are sorted by creation date (newest first)", () => __awaiter(void 0, void 0, void 0, function* () {
            const notification1 = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "First Notification" });
            const notification2 = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "Second Notification" });
            const notification3 = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "Third Notification" });
            yield (0, notifications_helper_1.createNotificationRequest)(notification1, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(notification2, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(notification3, adminCookie);
            const res = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.notifications).toHaveLength(3);
            const notifications = res.body.data.notifications;
            expect(notifications[0].title).toBe("Third Notification");
            expect(notifications[1].title).toBe("Second Notification");
            expect(notifications[2].title).toBe("First Notification");
            expect(new Date(notifications[0].createdAt).getTime()).toBeGreaterThan(new Date(notifications[1].createdAt).getTime());
            expect(new Date(notifications[1].createdAt).getTime()).toBeGreaterThan(new Date(notifications[2].createdAt).getTime());
        }));
        it("unread count is calculated correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const res = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.data.totalCount).toBe(3);
            expect(res.body.data.unreadCount).toBe(3);
        }));
    });
});
