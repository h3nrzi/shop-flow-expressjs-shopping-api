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
exports.NotificationController = void 0;
class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.getCurrentUserNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const { notifications, totalCount, unreadCount } = yield this.notificationService.getCurrentUserNotifications(userId);
            res.status(200).json({
                status: "success",
                results: notifications.length,
                data: {
                    notifications,
                    totalCount,
                    unreadCount,
                },
            });
        });
        this.getNotificationById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const notificationId = req.params.id;
            const userId = req.user.id;
            const notification = yield this.notificationService.getNotificationById(notificationId, userId);
            res.status(200).json({
                status: "success",
                data: { notification },
            });
        });
        this.getUnreadCount = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            const unreadCount = yield this.notificationService.getUnreadCount(userId);
            res.status(200).json({
                status: "success",
                data: { unreadCount },
            });
        });
        this.createNotification = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const createNotificationDto = req.body;
            const notification = yield this.notificationService.createNotification(createNotificationDto);
            res.status(201).json({
                status: "success",
                data: { notification },
            });
        });
        this.createBulkNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { userIds, title, message, type, data } = req.body;
            const notifications = yield this.notificationService.createBulkNotifications(userIds, title, message, type, data);
            res.status(201).json({
                status: "success",
                results: notifications.length,
                data: { notifications },
            });
        });
        this.markAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const notificationId = req.params.id;
            const userId = req.user.id;
            const notification = yield this.notificationService.markNotificationAsRead(notificationId, userId);
            res.status(200).json({
                status: "success",
                data: { notification },
            });
        });
        this.markAllAsRead = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            yield this.notificationService.markAllNotificationsAsReadForUser(userId);
            res.status(200).json({
                status: "success",
                message: "همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند",
            });
        });
        this.deleteNotification = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const notificationId = req.params.id;
            const userId = req.user.id;
            yield this.notificationService.deleteNotification(notificationId, userId);
            res.status(204).json({
                status: "success",
            });
        });
        this.deleteAllNotifications = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.id;
            yield this.notificationService.deleteAllNotificationsForUser(userId);
            res.status(204).json({
                status: "success",
            });
        });
    }
}
exports.NotificationController = NotificationController;
