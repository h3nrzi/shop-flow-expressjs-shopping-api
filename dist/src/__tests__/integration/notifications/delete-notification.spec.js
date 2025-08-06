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
describe("DELETE /api/notifications/:id", () => {
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
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 400, if", () => {
        it("notification ID is not a valid ObjectId", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)("invalid-id", userCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toContain("Cast to ObjectId failed");
        }));
        it("user tries to delete another user's notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const adminNotificationData = (0, notifications_helper_1.getValidNotificationData)(admin._id);
            const adminCreateRes = yield (0, notifications_helper_1.createNotificationRequest)(adminNotificationData, adminCookie);
            const adminNotificationId = adminCreateRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(adminNotificationId, userCookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شما مجاز به مشاهده این اعلان نیستید");
        }));
    });
    describe("should return 404, if", () => {
        it("notification does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = (0, notifications_helper_1.getInvalidObjectId)();
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(nonExistentId, userCookie);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
        }));
    });
    describe("should return 204, if", () => {
        it("notification is deleted successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const beforeRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, userCookie);
            expect(beforeRes.status).toBe(200);
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            expect(res.status).toBe(204);
            expect(res.body.status).toBe("success");
            const afterRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, userCookie);
            expect(afterRes.status).toBe(404);
        }));
        it("notification is completely removed from database", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const createRes2 = yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const beforeRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(beforeRes.body.data.notifications).toHaveLength(3);
            yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            const afterRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(afterRes.body.data.notifications).toHaveLength(2);
            expect(afterRes.body.data.totalCount).toBe(2);
            const remainingIds = afterRes.body.data.notifications.map((n) => n._id);
            expect(remainingIds).not.toContain(notificationId);
            expect(remainingIds).toContain(createRes2.body.data.notification._id);
        }));
        it("deleting read notification works correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const { markAsReadRequest } = yield Promise.resolve().then(() => __importStar(require("@/__tests__/helpers/notifications.helper")));
            yield markAsReadRequest(notificationId, userCookie);
            const readRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, userCookie);
            expect(readRes.body.data.notification.isRead).toBe(true);
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            expect(res.status).toBe(204);
            const afterRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(notificationId, userCookie);
            expect(afterRes.status).toBe(404);
        }));
        it("admin can delete their own notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const adminNotificationData = (0, notifications_helper_1.getValidNotificationData)(admin._id);
            const adminCreateRes = yield (0, notifications_helper_1.createNotificationRequest)(adminNotificationData, adminCookie);
            const adminNotificationId = adminCreateRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(adminNotificationId, adminCookie);
            expect(res.status).toBe(204);
            expect(res.body.status).toBe("success");
            const afterRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(adminNotificationId, adminCookie);
            expect(afterRes.status).toBe(404);
        }));
        it("deleting notification updates unread count correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const { getUnreadCountRequest } = yield Promise.resolve().then(() => __importStar(require("@/__tests__/helpers/notifications.helper")));
            const beforeRes = yield getUnreadCountRequest(userCookie);
            expect(beforeRes.body.data.unreadCount).toBe(3);
            yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            const afterRes = yield getUnreadCountRequest(userCookie);
            expect(afterRes.body.data.unreadCount).toBe(2);
        }));
        it("deleting notification with custom data works correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const customData = {
                user: user._id,
                title: "Custom Notification",
                message: "Custom message",
                type: "order",
                data: { orderId: "12345", customField: "test" },
            };
            const customCreateRes = yield (0, notifications_helper_1.createNotificationRequest)(customData, adminCookie);
            const customNotificationId = customCreateRes.body.data.notification._id;
            const res = yield (0, notifications_helper_1.deleteNotificationRequest)(customNotificationId, userCookie);
            expect(res.status).toBe(204);
            const afterRes = yield (0, notifications_helper_1.getNotificationByIdRequest)(customNotificationId, userCookie);
            expect(afterRes.status).toBe(404);
        }));
    });
    describe("should be idempotent", () => {
        it("deleting already deleted notification returns 404", () => __awaiter(void 0, void 0, void 0, function* () {
            const res1 = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            expect(res1.status).toBe(204);
            const res2 = yield (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            expect(res2.status).toBe(404);
            expect(res2.body.errors[0].message).toBe("اعلان مورد نظر یافت نشد");
        }));
    });
});
