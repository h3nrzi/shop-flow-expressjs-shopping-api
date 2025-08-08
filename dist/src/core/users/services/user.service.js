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
exports.UserService = void 0;
const bad_request_error_1 = require("../../../errors/bad-request-error");
const forbidden_error_1 = require("../../../errors/forbidden-error");
const not_authorized_error_1 = require("../../../errors/not-authorized-error");
const not_found_error_1 = require("../../../errors/not-found-error");
const unprocessable_entity_error_1 = require("../../../errors/unprocessable-entity-error");
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    getAllUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, skip, total, users } = yield this.userRepository.findAll(query);
            if (query.page && skip >= total) {
                throw new not_found_error_1.NotFoundError("این صفحه وجود ندارد");
            }
            return { pagination, users };
        });
    }
    findUserById(userId, select) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUser = yield this.userRepository.findById(userId, select);
            if (!targetUser) {
                throw new not_found_error_1.NotFoundError("هیچ موردی با این شناسه یافت نشد");
            }
            return targetUser;
        });
    }
    findUsersCountByDay(period) {
        return __awaiter(this, void 0, void 0, function* () {
            let startDate;
            const endDate = new Date();
            switch (period) {
                case "week":
                    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case "month":
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case "year":
                    startDate = new Date();
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                case "all":
                    startDate = undefined;
                    break;
                default:
                    throw new bad_request_error_1.BadRequestError("زمان وارد شده نامعتبر است");
            }
            return this.userRepository.findCountByDay(endDate, startDate);
        });
    }
    createUser(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.create({
                email: createUserDto.email,
                name: createUserDto.name,
                password: createUserDto.password,
                passwordConfirmation: createUserDto.passwordConfirmation,
            });
        });
    }
    updateUser(userId, updateUserDto, currentUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUser = yield this.findUserById(userId);
            if (targetUser.role === "admin") {
                if (currentUser.email !== "admin@gmail.com") {
                    throw new not_authorized_error_1.NotAuthorizedError("شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
                }
            }
            return this.userRepository.update(userId, updateUserDto);
        });
    }
    updateCurrentUserInfo(currentUser, updateUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (updateUserDto.password || updateUserDto.passwordConfirmation) {
                throw new unprocessable_entity_error_1.UnprocessableEntityError("با این درخواست نمی توانید رمز عبور را آپدیت کنید");
            }
            const updatedUser = yield this.userRepository.update(currentUser.id, {
                name: (_a = updateUserDto.name) !== null && _a !== void 0 ? _a : currentUser.name,
                email: (_b = updateUserDto.email) !== null && _b !== void 0 ? _b : currentUser.email,
                photo: (_c = updateUserDto.photo) !== null && _c !== void 0 ? _c : currentUser.photo,
            });
            return updatedUser;
        });
    }
    updateCurrentUserPassword(currentUser, updateCurrentUserPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUser = yield this.findUserById(currentUser.id, "+password");
            const correct = yield targetUser.correctPassword(updateCurrentUserPasswordDto.passwordCurrent);
            if (!correct) {
                throw new forbidden_error_1.ForbiddenError("رمز عبور فعلی شما اشتباه است");
            }
            const { password, passwordConfirmation } = updateCurrentUserPasswordDto;
            targetUser.password = password;
            targetUser.passwordConfirmation = passwordConfirmation;
            yield targetUser.save();
            return targetUser;
        });
    }
    deleteUser(userId, currentUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetUser = yield this.findUserById(userId);
            if (targetUser.role === "admin") {
                if (currentUser.email !== "admin@gmail.com") {
                    throw new not_authorized_error_1.NotAuthorizedError("شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
                }
            }
            yield this.userRepository.delete(userId);
        });
    }
    deleteCurrentUser(currentUser) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userRepository.delete(currentUser.id);
        });
    }
}
exports.UserService = UserService;
