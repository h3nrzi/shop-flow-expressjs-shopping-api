"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
describe("PATCH /api/notifications/mark-all-read", () => {
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
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 200, if", () => {
        it("user has no notifications", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند");
        }));
        it("all user notifications are marked as read", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const beforeRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(beforeRes.body.data.unreadCount).toBe(3);
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.message).toBe("همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند");
            const afterRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(afterRes.body.data.unreadCount).toBe(0);
        }));
        it("only current user's notifications are marked as read", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(admin._id), adminCookie);
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res.status).toBe(200);
            const userUnreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            const adminUnreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(adminCookie);
            expect(userUnreadRes.body.data.unreadCount).toBe(0);
            expect(adminUnreadRes.body.data.unreadCount).toBe(1);
        }));
        it("notifications status is correctly updated in database", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            const notificationsRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            const notifications = notificationsRes.body.data.notifications;
            expect(notifications).toHaveLength(2);
            notifications.forEach((notification) => {
                expect(notification.isRead).toBe(true);
                expect(notification.readAt).toBeDefined();
            });
        }));
        it("already read notifications remain read", () => __awaiter(void 0, void 0, void 0, function* () {
            const createRes1 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const { markAsReadRequest } = yield Promise.resolve().then(() => __importStar(require("@/__tests__/helpers/notifications.helper")));
            yield markAsReadRequest(createRes1.body.data.notification._id, userCookie);
            const beforeRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(beforeRes.body.data.unreadCount).toBe(1);
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res.status).toBe(200);
            const afterRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(afterRes.body.data.unreadCount).toBe(0);
        }));
        it("works when user has mix of different notification types", () => __awaiter(void 0, void 0, void 0, function* () {
            const systemNotification = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { type: "system" });
            const orderNotification = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { type: "order" });
            const promotionNotification = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { type: "promotion" });
            const reviewNotification = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { type: "review" });
            yield (0, notifications_helper_1.createNotificationRequest)(systemNotification, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(orderNotification, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(promotionNotification, adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)(reviewNotification, adminCookie);
            const beforeRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(beforeRes.body.data.unreadCount).toBe(4);
            const res = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res.status).toBe(200);
            const afterRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(afterRes.body.data.unreadCount).toBe(0);
        }));
        it("operation is idempotent", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const res1 = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res1.status).toBe(200);
            const res2 = yield (0, notifications_helper_1.markAllAsReadRequest)(userCookie);
            expect(res2.status).toBe(200);
            const afterRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(afterRes.body.data.unreadCount).toBe(0);
        }));
    });
});
