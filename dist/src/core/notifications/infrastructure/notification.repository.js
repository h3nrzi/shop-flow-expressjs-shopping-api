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
exports.NotificationRepository = void 0;
class NotificationRepository {
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    findAllForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationModel
                .find({
                user: userId,
            })
                .populate("user", "name email")
                .exec();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationModel.findById(id).populate("user", "name email");
        });
    }
    create(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationModel.create(notification);
        });
    }
    createMany(notifications) {
        return __awaiter(this, void 0, void 0, function* () {
            const createdNotifications = yield this.notificationModel.insertMany(notifications);
            return createdNotifications.map((notification) => notification.toObject());
        });
    }
    markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationModel
                .findByIdAndUpdate(notificationId, {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }, { new: true })
                .populate("user", "name email");
        });
    }
    markAllAsReadForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationModel.updateMany({
                user: userId,
                isRead: false,
            }, {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
        });
    }
    findUnreadCountForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.notificationModel.countDocuments({
                user: userId,
                isRead: false,
            });
        });
    }
    delete(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationModel.findByIdAndDelete(notificationId);
        });
    }
    deleteAllForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationModel.deleteMany({ user: userId });
        });
    }
}
exports.NotificationRepository = NotificationRepository;
