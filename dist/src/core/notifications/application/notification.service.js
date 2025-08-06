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
exports.NotificationService = void 0;
const bad_request_error_1 = require("../../../errors/bad-request-error");
const not_found_error_1 = require("../../../errors/not-found-error");
class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    getCurrentUserNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield this.notificationRepository.findAllForUser(userId);
            const totalCount = notifications.length;
            const unreadCount = yield this.notificationRepository.findUnreadCountForUser(userId);
            return { notifications, totalCount, unreadCount };
        });
    }
    getNotificationById(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const notification = yield this.notificationRepository.findById(notificationId);
            if (!notification) {
                throw new not_found_error_1.NotFoundError("اعلان مورد نظر یافت نشد");
            }
            if (notification.user.toString() !== userId) {
                throw new bad_request_error_1.BadRequestError("شما مجاز به مشاهده این اعلان نیستید");
            }
            return notification;
        });
    }
    getUnreadCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationRepository.findUnreadCountForUser(userId);
        });
    }
    createNotification(createNotificationDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationRepository.create(createNotificationDto);
        });
    }
    createSystemNotification(userId, title, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createNotification({
                user: userId,
                title,
                message,
                type: "system",
                data,
            });
        });
    }
    createOrderNotification(userId, title, message, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createNotification({
                user: userId,
                title,
                message,
                type: "order",
                data: orderId ? { orderId } : undefined,
            });
        });
    }
    createPromotionNotification(userId, title, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createNotification({
                user: userId,
                title,
                message,
                type: "promotion",
                data,
            });
        });
    }
    createReviewNotification(userId, title, message, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createNotification({
                user: userId,
                title,
                message,
                type: "review",
                data,
            });
        });
    }
    markNotificationAsRead(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getNotificationById(notificationId, userId);
            const updatedNotification = yield this.notificationRepository.markAsRead(notificationId);
            if (!updatedNotification) {
                throw new not_found_error_1.NotFoundError("خطا در به‌روزرسانی اعلان");
            }
            return updatedNotification;
        });
    }
    markAllNotificationsAsReadForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationRepository.markAllAsReadForUser(userId);
        });
    }
    deleteNotification(notificationId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getNotificationById(notificationId, userId);
            yield this.notificationRepository.delete(notificationId);
        });
    }
    deleteAllNotificationsForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationRepository.deleteAllForUser(userId);
        });
    }
    createBulkNotifications(userIds, title, message, type, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = userIds.map((userId) => ({
                user: userId,
                title,
                message,
                type,
                data,
            }));
            return this.notificationRepository.createMany(notifications);
        });
    }
    createNotificationForAllUsers(title_1, message_1) {
        return __awaiter(this, arguments, void 0, function* (title, message, type = "system", data) {
            throw new bad_request_error_1.BadRequestError("عملیات ارسال اعلان برای همه کاربران هنوز پیاده‌سازی نشده است");
        });
    }
}
exports.NotificationService = NotificationService;
