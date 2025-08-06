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
describe("GET /api/notifications/unread-count", () => {
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
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 200, if", () => {
        it("user has no notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.unreadCount).toBe(0);
        }));
        it("user has all unread notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.unreadCount).toBe(3);
        }));
        it("user has some read and some unread notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const createRes1 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const createRes2 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.markAsReadRequest)(createRes1.body.data.notification._id, userCookie);
            yield (0, notifications_helper_1.markAsReadRequest)(createRes2.body.data.notification._id, userCookie);
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.unreadCount).toBe(1);
        }));
        it("user has all read notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const createRes1 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const createRes2 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.markAsReadRequest)(createRes1.body.data.notification._id, userCookie);
            yield (0, notifications_helper_1.markAsReadRequest)(createRes2.body.data.notification._id, userCookie);
            const res = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.unreadCount).toBe(0);
        }));
        it("unread count only includes current user's notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(admin._id), adminCookie);
            const userRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            const adminRes = yield (0, notifications_helper_1.getUnreadCountRequest)(adminCookie);
            expect(userRes.status).toBe(200);
            expect(userRes.body.data.unreadCount).toBe(2);
            expect(adminRes.status).toBe(200);
            expect(adminRes.body.data.unreadCount).toBe(1);
        }));
    });
});
