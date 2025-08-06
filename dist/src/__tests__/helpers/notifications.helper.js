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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectValidNotificationResponse = exports.getInvalidBulkNotificationData = exports.getInvalidNotificationData = exports.getValidBulkNotificationData = exports.getValidNotificationData = exports.createTestAdminAndGetCookie = exports.createTestUserAndGetCookie = exports.getInvalidObjectId = exports.createBulkNotificationsRequest = exports.createNotificationRequest = exports.deleteAllNotificationsRequest = exports.deleteNotificationRequest = exports.markAllAsReadRequest = exports.markAsReadRequest = exports.getUnreadCountRequest = exports.getNotificationByIdRequest = exports.getNotificationsRequest = void 0;
const app_1 = __importDefault(require("@/app"));
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const auth_helper_1 = require("./auth.helper");
const getNotificationsRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).get("/api/notifications");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.getNotificationsRequest = getNotificationsRequest;
const getNotificationByIdRequest = (id, cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).get(`/api/notifications/${id}`);
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.getNotificationByIdRequest = getNotificationByIdRequest;
const getUnreadCountRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).get("/api/notifications/unread-count");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.getUnreadCountRequest = getUnreadCountRequest;
const markAsReadRequest = (id, cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).patch(`/api/mark-read/${id}`);
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.markAsReadRequest = markAsReadRequest;
const markAllAsReadRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).patch("/api/notifications/mark-all-read");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.markAllAsReadRequest = markAllAsReadRequest;
const deleteNotificationRequest = (id, cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).delete(`/api/notifications/${id}`);
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.deleteNotificationRequest = deleteNotificationRequest;
const deleteAllNotificationsRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).delete("/api/notifications/delete-all");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.deleteAllNotificationsRequest = deleteAllNotificationsRequest;
const createNotificationRequest = (body, cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).post("/api/notifications");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send(body);
});
exports.createNotificationRequest = createNotificationRequest;
const createBulkNotificationsRequest = (body, cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).post("/api/notifications/bulk");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send(body);
});
exports.createBulkNotificationsRequest = createBulkNotificationsRequest;
const getInvalidObjectId = () => {
    return new mongoose_1.default.Types.ObjectId().toString();
};
exports.getInvalidObjectId = getInvalidObjectId;
const createTestUserAndGetCookie = (suffix) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_helper_1.getUniqueUser)(suffix);
    yield (0, auth_helper_1.signupRequest)(user);
    const loginRes = yield (0, auth_helper_1.loginRequest)(user);
    const cookie = loginRes.headers["set-cookie"][0];
    return { cookie, user: loginRes.body.data.user };
});
exports.createTestUserAndGetCookie = createTestUserAndGetCookie;
const createTestAdminAndGetCookie = (suffix) => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_helper_1.getUniqueUser)(suffix);
    yield (0, auth_helper_1.signupRequest)(user);
    yield (0, auth_helper_1.loginRequest)(user);
    const { userRepository } = yield Promise.resolve().then(() => __importStar(require("@/core")));
    const userDoc = yield userRepository.findByEmail(user.email);
    userDoc.role = "admin";
    yield userDoc.save({ validateBeforeSave: false });
    const adminLoginRes = yield (0, auth_helper_1.loginRequest)(user);
    const cookie = adminLoginRes.headers["set-cookie"][0];
    return { cookie, user: adminLoginRes.body.data.user };
});
exports.createTestAdminAndGetCookie = createTestAdminAndGetCookie;
const getValidNotificationData = (userId) => ({
    user: userId,
    title: "Test Notification",
    message: "This is a test notification message",
    type: "system",
    data: { testData: "test value" },
});
exports.getValidNotificationData = getValidNotificationData;
const getValidBulkNotificationData = (userIds) => ({
    userIds,
    title: "Bulk Test Notification",
    message: "This is a bulk test notification message",
    type: "promotion",
    data: { bulkTest: true },
});
exports.getValidBulkNotificationData = getValidBulkNotificationData;
const getInvalidNotificationData = () => [
    {
        testCase: "User ID is not provided",
        data: {
            user: "",
            title: "Test",
            message: "Test message",
            type: "system",
        },
        expectedError: "شناسه کاربر معتبر نیست",
    },
    {
        testCase: "User ID is not a valid MongoDB ObjectId",
        data: {
            user: "invalid-id",
            title: "Test",
            message: "Test message",
            type: "system",
        },
        expectedError: "شناسه کاربر معتبر نیست",
    },
    {
        testCase: "Title is not provided",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "",
            message: "Test message",
            type: "system",
        },
        expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
    },
    {
        testCase: "Title is too long",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "a".repeat(201),
            message: "Test message",
            type: "system",
        },
        expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
    },
    {
        testCase: "Message is not provided",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "Test",
            message: "",
            type: "system",
        },
        expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
    },
    {
        testCase: "Message is too long",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "Test",
            message: "a".repeat(1001),
            type: "system",
        },
        expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
    },
    {
        testCase: "Type is invalid",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "Test",
            message: "Test message",
            type: "invalid-type",
        },
        expectedError: "نوع اعلان معتبر نیست",
    },
    {
        testCase: "Data is not an object",
        data: {
            user: (0, exports.getInvalidObjectId)(),
            title: "Test",
            message: "Test message",
            type: "system",
            data: "invalid-data",
        },
        expectedError: "داده‌های اضافی باید از نوع آبجکت باشد",
    },
];
exports.getInvalidNotificationData = getInvalidNotificationData;
const getInvalidBulkNotificationData = () => [
    {
        testCase: "UserIds is not provided",
        data: {
            userIds: [],
            title: "Test",
            message: "Test message",
            type: "system",
        },
        expectedError: "لیست شناسه کاربران الزامی است",
    },
    {
        testCase: "UserIds contains invalid ObjectId",
        data: {
            userIds: ["invalid-id"],
            title: "Test",
            message: "Test message",
            type: "system",
        },
        expectedError: "شناسه کاربر معتبر نیست",
    },
    {
        testCase: "Title is not provided",
        data: {
            userIds: [(0, exports.getInvalidObjectId)()],
            title: "",
            message: "Test message",
            type: "system",
        },
        expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
    },
    {
        testCase: "Message is not provided",
        data: {
            userIds: [(0, exports.getInvalidObjectId)()],
            title: "Test",
            message: "",
            type: "system",
        },
        expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
    },
    {
        testCase: "Type is invalid",
        data: {
            userIds: [(0, exports.getInvalidObjectId)()],
            title: "Test",
            message: "Test message",
            type: "invalid-type",
        },
        expectedError: "نوع اعلان معتبر نیست",
    },
];
exports.getInvalidBulkNotificationData = getInvalidBulkNotificationData;
const expectValidNotificationResponse = (notification, expectedData) => {
    expect(notification).toBeDefined();
    expect(notification._id).toBeDefined();
    expect(notification.user).toBeDefined();
    expect(notification.title).toBeDefined();
    expect(notification.message).toBeDefined();
    expect(notification.type).toBeDefined();
    expect(notification.isRead).toBe(false);
    expect(notification.createdAt).toBeDefined();
    expect(notification.updatedAt).toBeDefined();
    if (expectedData) {
        if (expectedData.title)
            expect(notification.title).toBe(expectedData.title);
        if (expectedData.message)
            expect(notification.message).toBe(expectedData.message);
        if (expectedData.type)
            expect(notification.type).toBe(expectedData.type);
        if (expectedData.data)
            expect(notification.data).toEqual(expectedData.data);
    }
};
exports.expectValidNotificationResponse = expectValidNotificationResponse;
