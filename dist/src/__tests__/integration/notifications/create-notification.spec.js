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
describe("POST /api/notifications", () => {
    let userCookie;
    let adminCookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("notificationuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, notifications_helper_1.createTestAdminAndGetCookie)("notificationadmin");
        adminCookie = testAdmin.cookie;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 403, if", () => {
        it("user is not an admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, userCookie);
            expect(res.status).toBe(403);
            expect(res.body.errors[0].message).toBe("شما مجاز به انجام این عمل نیستید");
        }));
    });
    describe("should return 400, if", () => {
        it.each((0, notifications_helper_1.getInvalidNotificationData)())("$testCase", (_a) => __awaiter(void 0, [_a], void 0, function* ({ data, expectedError }) {
            const res = yield (0, notifications_helper_1.createNotificationRequest)(data, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe(expectedError);
        }));
        it("user does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentUserId = (0, notifications_helper_1.getInvalidObjectId)();
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(nonExistentUserId);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("کاربر مورد نظر یافت نشد");
        }));
    });
    describe("should return 201, if", () => {
        it("notification is created successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.data.notification).toBeDefined();
            const notification = res.body.data.notification;
            (0, notifications_helper_1.expectValidNotificationResponse)(notification, notificationData);
            expect(notification.user).toBe(user._id);
        }));
        it("notification is created with all valid notification types", () => __awaiter(void 0, void 0, void 0, function* () {
            const types = ["order", "promotion", "system", "review"];
            for (const type of types) {
                const notificationData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { type });
                const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
                expect(res.status).toBe(201);
                expect(res.body.data.notification.type).toBe(type);
            }
        }));
        it("notification is created with optional data field", () => __awaiter(void 0, void 0, void 0, function* () {
            const customData = { orderId: "12345", amount: 100, currency: "USD" };
            const notificationData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { data: customData });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.data.notification.data).toEqual(customData);
        }));
        it("notification is created without optional data field", () => __awaiter(void 0, void 0, void 0, function* () {
            const _a = (0, notifications_helper_1.getValidNotificationData)(user._id), { data } = _a, notificationDataWithoutData = __rest(_a, ["data"]);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationDataWithoutData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.data.notification.data).toBeUndefined();
        }));
        it("notification has correct default values", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            expect(notification.isRead).toBe(false);
            expect(notification.readAt).toBeNull();
            expect(notification.createdAt).toBeDefined();
            expect(notification.updatedAt).toBeDefined();
            expect(new Date(notification.createdAt)).toBeInstanceOf(Date);
            expect(new Date(notification.updatedAt)).toBeInstanceOf(Date);
        }));
        it("admin can create notifications for different users", () => __awaiter(void 0, void 0, void 0, function* () {
            const anotherTestUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("anotheruser");
            const userNotification = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const anotherUserNotification = (0, notifications_helper_1.getValidNotificationData)(anotherTestUser.user._id);
            const userRes = yield (0, notifications_helper_1.createNotificationRequest)(userNotification, adminCookie);
            const anotherUserRes = yield (0, notifications_helper_1.createNotificationRequest)(anotherUserNotification, adminCookie);
            expect(userRes.status).toBe(201);
            expect(anotherUserRes.status).toBe(201);
            expect(userRes.body.data.notification.user).toBe(user._id);
            expect(anotherUserRes.body.data.notification.user).toBe(anotherTestUser.user._id);
        }));
        it("notification with custom title and message", () => __awaiter(void 0, void 0, void 0, function* () {
            const customTitle = "Custom Notification Title";
            const customMessage = "This is a custom notification message with special characters: !@#$%";
            const notificationData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: customTitle, message: customMessage });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(201);
            expect(res.body.data.notification.title).toBe(customTitle);
            expect(res.body.data.notification.message).toBe(customMessage);
        }));
    });
});
