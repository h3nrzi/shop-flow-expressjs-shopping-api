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
describe("GET /api/notifications/:id", () => {
    let userCookie;
    let adminCookie;
    let user;
    let admin;
    let notificationId;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, notifications_helper_1.createTestUserAndGetCookie)("notificationuser");
        userCookie = testUser.cookie;
        user = testUser.user;
        const testAdmin = yield (0, notifications_helper_1.createTestAdminAndGetCookie)("notificationadmin");
        adminCookie = testAdmin.cookie;
        admin = testAdmin.user;
        const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
        const createRes = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
        notificationId = createRes.body.data.notification._id;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("notification ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)("invalid-id", userCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toContain("Cast to ObjectId failed");
        }));
        it("user tries to access another user's notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const adminNotificationData = (0, notifications_helper_1.getValidNotificationData)(admin._id);
            const adminCreateRes = yield (0, notifications_helper_1.createNotificationRequest)(adminNotificationData, adminCookie);
            const adminNotificationId = adminCreateRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(adminNotificationId, userCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شما مجاز به مشاهده این اعلان نیستید");
        }));
    });
    describe("should return 404, if", () => {
        it("notification does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = (0, notifications_helper_1.getInvalidObjectId)();
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(nonExistentId, userCookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
        }));
    });
    describe("should return 200, if", () => {
        it("notification exists and belongs to the user", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.notification).toBeDefined();
            const notification = res.body.data.notification;
            (0, notifications_helper_1.expectValidNotificationResponse)(notification);
            expect(notification._id).toBe(notificationId);
            expect(notification.user).toBe(user._id);
        }));
        it("returns correct notification data", () => __awaiter(void 0, void 0, void 0, function* () {
            const customData = {
                user: user._id,
                title: "Custom Test Notification",
                message: "This is a custom test message",
                type: "order",
                data: { orderId: "12345", customField: "test" },
            };
            const createRes = yield (0, notifications_helper_1.createNotificationRequest)(customData, adminCookie);
            const customNotificationId = createRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(customNotificationId, userCookie);
            expect(res.status).toBe(200);
            const notification = res.body.data.notification;
            (0, notifications_helper_1.expectValidNotificationResponse)(notification, customData);
        }));
        it("admin can access their own notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const adminNotificationData = (0, notifications_helper_1.getValidNotificationData)(admin._id);
            const adminCreateRes = yield (0, notifications_helper_1.createNotificationRequest)(adminNotificationData, adminCookie);
            const adminNotificationId = adminCreateRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.getNotificationByIdRequest)(adminNotificationId, adminCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.notification.user).toBe(admin._id);
        }));
    });
});
