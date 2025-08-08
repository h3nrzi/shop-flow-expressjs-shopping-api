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
const notifications_helper_1 = require("@/__tests__/helpers/notifications.helper");
describe("Notification Edge Cases", () => {
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
    describe("Notification Lifecycle Edge Cases", () => {
        it("should handle rapid successive operations on the same notification", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const createRes = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            const notificationId = createRes.body.data.notification._id;
            const markReadPromise = (0, notifications_helper_1.markAsReadRequest)(notificationId, userCookie);
            const getNotificationPromise = require("@/__tests__/helpers/notifications.helper").getNotificationByIdRequest(notificationId, userCookie);
            const [markReadRes, getRes] = yield Promise.all([
                markReadPromise,
                getNotificationPromise,
            ]);
            expect(markReadRes.status).toBe(200);
            expect(getRes.status).toBe(200);
        }));
        it("should handle marking notification as read multiple times concurrently", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const createRes = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            const notificationId = createRes.body.data.notification._id;
            const promises = Array(3)
                .fill(null)
                .map(() => (0, notifications_helper_1.markAsReadRequest)(notificationId, userCookie));
            const results = yield Promise.all(promises);
            results.forEach((res) => {
                expect(res.status).toBe(200);
                expect(res.body.data.notification.isRead).toBe(true);
            });
        }));
        it("should handle deleting a notification while it's being marked as read", () => __awaiter(void 0, void 0, void 0, function* () {
            const notificationData = (0, notifications_helper_1.getValidNotificationData)(user._id);
            const createRes = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            const notificationId = createRes.body.data.notification._id;
            const markReadPromise = (0, notifications_helper_1.markAsReadRequest)(notificationId, userCookie);
            const deletePromise = (0, notifications_helper_1.deleteNotificationRequest)(notificationId, userCookie);
            const results = yield Promise.allSettled([
                markReadPromise,
                deletePromise,
            ]);
            const successCount = results.filter((result) => result.status === "fulfilled" && result.value.status < 400).length;
            expect(successCount).toBeGreaterThanOrEqual(1);
        }));
    });
    describe("Large Data Handling", () => {
        it("should handle notification with large data payload", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const notificationData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { data: largeData });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            (0, notifications_helper_1.expectValidNotificationResponse)(notification, notificationData);
            expect(notification.data).toEqual(largeData);
        }));
        it("should handle creating many notifications for a single user", () => __awaiter(void 0, void 0, void 0, function* () {
            const promises = Array(20)
                .fill(null)
                .map((_, i) => {
                const notificationData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: `Notification ${i + 1}`, message: `This is notification number ${i + 1}` });
                return (0, notifications_helper_1.createNotificationRequest)(notificationData, adminCookie);
            });
            const results = yield Promise.all(promises);
            results.forEach((res, index) => {
                expect(res.status).toBe(201);
                expect(res.body.data.notification.title).toBe(`Notification ${index + 1}`);
            });
            const userNotificationsRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(userNotificationsRes.body.data.notifications).toHaveLength(20);
            expect(userNotificationsRes.body.data.unreadCount).toBe(20);
        }));
    });
    describe("Special Characters and Encoding", () => {
        it("should handle notifications with special characters and emojis", () => __awaiter(void 0, void 0, void 0, function* () {
            const specialCharsData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "Special: ñáéíóú çñ 中文 العربية 🎉🚀💡", message: "Message with special chars: @#$%^&*()_+-=[]{}|;':\",./<>? and emojis 😀🎊🌟🔥💯" });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(specialCharsData, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            expect(notification.title).toBe(specialCharsData.title);
            expect(notification.message).toBe(specialCharsData.message);
        }));
        it("should handle notifications with HTML-like content", () => __awaiter(void 0, void 0, void 0, function* () {
            const htmlLikeData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "<div>HTML Title</div>", message: "<script>alert('xss')</script><p>This looks like HTML but should be treated as text</p>" });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(htmlLikeData, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            expect(notification.title).toBe(htmlLikeData.title);
            expect(notification.message).toBe(htmlLikeData.message);
        }));
        it("should handle notifications with SQL-like content", () => __awaiter(void 0, void 0, void 0, function* () {
            const sqlLikeData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "SQL: SELECT * FROM users;", message: "DROP TABLE notifications; -- This should be treated as text" });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(sqlLikeData, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            expect(notification.title).toBe(sqlLikeData.title);
            expect(notification.message).toBe(sqlLikeData.message);
        }));
    });
    describe("Data Consistency", () => {
        it("should maintain consistent unread count after multiple operations", () => __awaiter(void 0, void 0, void 0, function* () {
            const createPromises = Array(5)
                .fill(null)
                .map(() => (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie));
            const createResults = yield Promise.all(createPromises);
            const notificationIds = createResults.map((res) => res.body.data.notification._id);
            let unreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(unreadRes.body.data.unreadCount).toBe(5);
            yield (0, notifications_helper_1.markAsReadRequest)(notificationIds[0], userCookie);
            yield (0, notifications_helper_1.markAsReadRequest)(notificationIds[1], userCookie);
            unreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(unreadRes.body.data.unreadCount).toBe(3);
            yield (0, notifications_helper_1.deleteNotificationRequest)(notificationIds[2], userCookie);
            unreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(unreadRes.body.data.unreadCount).toBe(2);
            yield (0, notifications_helper_1.deleteNotificationRequest)(notificationIds[0], userCookie);
            unreadRes = yield (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            expect(unreadRes.body.data.unreadCount).toBe(2);
        }));
        it("should handle concurrent read/unread count requests", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const promises = Array(5)
                .fill(null)
                .map(() => (0, notifications_helper_1.getUnreadCountRequest)(userCookie));
            const results = yield Promise.all(promises);
            results.forEach((res) => {
                expect(res.status).toBe(200);
                expect(res.body.data.unreadCount).toBe(2);
            });
        }));
    });
    describe("Notification Data Integrity", () => {
        it("should preserve notification data through read/unread cycle", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalData = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { title: "Data Integrity Test", message: "Testing data preservation", data: {
                    orderId: "ORDER123",
                    productId: "PROD456",
                    metadata: { timestamp: Date.now(), version: "1.0" },
                } });
            const createRes = yield (0, notifications_helper_1.createNotificationRequest)(originalData, adminCookie);
            const notificationId = createRes.body.data.notification._id;
            const markReadRes = yield (0, notifications_helper_1.markAsReadRequest)(notificationId, userCookie);
            const readNotification = markReadRes.body.data.notification;
            expect(readNotification.title).toBe(originalData.title);
            expect(readNotification.message).toBe(originalData.message);
            expect(readNotification.data).toEqual(originalData.data);
            expect(readNotification.type).toBe(originalData.type);
        }));
        it("should handle notifications with null/undefined values in data", () => __awaiter(void 0, void 0, void 0, function* () {
            const dataWithNulls = Object.assign(Object.assign({}, (0, notifications_helper_1.getValidNotificationData)(user._id)), { data: {
                    orderId: "ORDER123",
                    productId: null,
                    metadata: undefined,
                    emptyString: "",
                    zero: 0,
                    falseValue: false,
                } });
            const res = yield (0, notifications_helper_1.createNotificationRequest)(dataWithNulls, adminCookie);
            expect(res.status).toBe(201);
            const notification = res.body.data.notification;
            expect(notification.data.orderId).toBe("ORDER123");
            expect(notification.data.productId).toBeNull();
            expect(notification.data.hasOwnProperty("metadata")).toBe(false);
            expect(notification.data.emptyString).toBe("");
            expect(notification.data.zero).toBe(0);
            expect(notification.data.falseValue).toBe(false);
        }));
    });
    describe("Performance Edge Cases", () => {
        it("should handle rapid notification creation and deletion", () => __awaiter(void 0, void 0, void 0, function* () {
            const operations = [];
            for (let i = 0; i < 10; i++) {
                const createOp = (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie)
                    .then((res) => res.body.data.notification._id)
                    .then((id) => (0, notifications_helper_1.deleteNotificationRequest)(id, userCookie));
                operations.push(createOp);
            }
            const results = yield Promise.allSettled(operations);
            const successCount = results.filter((result) => result.status === "fulfilled").length;
            expect(successCount).toBeGreaterThanOrEqual(8);
        }));
        it("should handle concurrent notification list requests during modifications", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            yield (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const listPromises = Array(5)
                .fill(null)
                .map(() => (0, notifications_helper_1.getNotificationsRequest)(userCookie));
            const createPromise = (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie);
            const countPromise = (0, notifications_helper_1.getUnreadCountRequest)(userCookie);
            const results = yield Promise.all([
                ...listPromises,
                createPromise,
                countPromise,
            ]);
            listPromises.forEach((_, index) => {
                expect(results[index].status).toBe(200);
            });
            expect(results[results.length - 2].status).toBe(201);
            expect(results[results.length - 1].status).toBe(200);
        }));
    });
    describe("Memory and Resource Management", () => {
        it("should handle cleanup after bulk operations", () => __awaiter(void 0, void 0, void 0, function* () {
            const promises = Array(50)
                .fill(null)
                .map(() => (0, notifications_helper_1.createNotificationRequest)((0, notifications_helper_1.getValidNotificationData)(user._id), adminCookie));
            yield Promise.all(promises);
            let listRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(listRes.body.data.notifications).toHaveLength(50);
            const { deleteAllNotificationsRequest } = yield Promise.resolve().then(() => __importStar(require("@/__tests__/helpers/notifications.helper")));
            const deleteRes = yield deleteAllNotificationsRequest(userCookie);
            expect(deleteRes.status).toBe(204);
            listRes = yield (0, notifications_helper_1.getNotificationsRequest)(userCookie);
            expect(listRes.body.data.notifications).toHaveLength(0);
            expect(listRes.body.data.unreadCount).toBe(0);
        }));
    });
});
