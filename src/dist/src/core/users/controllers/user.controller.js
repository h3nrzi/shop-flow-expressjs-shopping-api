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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const createSendTokenAndResponse_1 = __importDefault(require("../../../utils/createSendTokenAndResponse"));
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    findAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, users } = yield this.userService.getAllUsers(req.query);
            res.status(200).json({
                status: "success",
                results: users.length,
                pagination,
                data: { users },
            });
        });
    }
    findUsersCountByDay(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const period = req.query.period;
            const usersCountByDay = yield this.userService.findUsersCountByDay(period !== null && period !== void 0 ? period : "all");
            res.status(200).json({
                status: "success",
                results: usersCountByDay.length,
                data: { usersCountByDay },
            });
        });
    }
    findUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findUserById(req.params.id);
            res.status(200).json({
                status: "success",
                data: { user },
            });
        });
    }
    getCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentUser = req.user;
            res.status(200).json({
                status: "success",
                data: { currentUser },
            });
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.createUser(req.body);
            res.status(201).json({
                status: "success",
                data: { user },
            });
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.updateUser(req.params.id, req.body, req.user);
            res.status(200).json({
                status: "success",
                data: { user },
            });
        });
    }
    updateCurrentUserInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userService.updateCurrentUserInfo(req.user, req.body);
            res.status(200).json({
                status: "success",
                data: { updatedUser },
            });
        });
    }
    updateCurrentUserPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield this.userService.updateCurrentUserPassword(req.user, req.body);
            (0, createSendTokenAndResponse_1.default)(updatedUser, 200, res);
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userService.deleteUser(req.params.id, req.user);
            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
    deleteCurrentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userService.deleteCurrentUser(req.user);
            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
}
exports.UserController = UserController;
