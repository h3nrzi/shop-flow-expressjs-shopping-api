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
exports.AuthController = void 0;
const createSendTokenAndResponse_1 = __importDefault(require("../../../utils/createSendTokenAndResponse"));
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.signup(req.body);
            (0, createSendTokenAndResponse_1.default)(user, 201, res);
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.login(req.body);
            (0, createSendTokenAndResponse_1.default)(user, 200, res);
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.user) {
                req.user.refreshToken = undefined;
                req.user.refreshTokenExpires = undefined;
                yield req.user.save({ validateBeforeSave: false });
            }
            res.cookie("jwt", "", {
                expires: new Date(Date.now() - 1000),
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                sameSite: "lax",
            });
            res.cookie("refreshToken", "", {
                expires: new Date(Date.now() - 1000),
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                sameSite: "lax",
            });
            res.status(204).header("x-auth-token", "").json({});
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authService.forgotPassword(req.body);
            res.status(200).json({
                status: "success",
                message: "ایمیل بازیابی رمز عبور با موفقیت ارسال شد",
            });
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.refreshToken(req.cookies.refreshToken);
            (0, createSendTokenAndResponse_1.default)(user, 200, res);
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.resetPassword(req.body, req.query.resetToken);
            (0, createSendTokenAndResponse_1.default)(user, 200, res);
        });
    }
}
exports.AuthController = AuthController;
