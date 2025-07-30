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
exports.AuthService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const internal_server_error_1 = require("../../../errors/internal-server-error");
const not_authorized_error_1 = require("../../../errors/not-authorized-error");
const not_found_error_1 = require("../../../errors/not-found-error");
const email_1 = require("../../../utils/email");
const refreshToken_1 = require("../../../utils/refreshToken");
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    signup(signupDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userRepository.create({
                email: signupDto.email,
                name: signupDto.name,
                password: signupDto.password,
                passwordConfirmation: signupDto.passwordConfirmation,
            });
        });
    }
    login(loginDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginDto;
            const authenticatedUser = yield this.userRepository.findByEmail(email, "+password");
            if (!authenticatedUser) {
                throw new not_authorized_error_1.NotAuthorizedError("ایمیل یا رمز عبور اشتباه است!");
            }
            if (!authenticatedUser.active) {
                throw new not_authorized_error_1.NotAuthorizedError("کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید.");
            }
            const correct = yield authenticatedUser.correctPassword(password);
            if (!correct)
                throw new not_authorized_error_1.NotAuthorizedError("ایمیل یا رمز عبور اشتباه است!");
            return authenticatedUser;
        });
    }
    forgotPassword(forgotPasswordDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(forgotPasswordDto.email);
            if (!user) {
                throw new not_found_error_1.NotFoundError("هیچ کاربری با این آدرس ایمیل وجود ندارد.");
            }
            if (!user.active) {
                throw new not_authorized_error_1.NotAuthorizedError("کاربری که به این ایمیل مرتبط است مسدود شده است!");
            }
            const resetToken = user.createPasswordResetToken();
            yield user.save({ validateBeforeSave: false });
            let url = `http://localhost:5173/reset-password/${resetToken}`;
            if (process.env.NODE_ENV === "production") {
                url = `https://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            }
            try {
                yield (0, email_1.sendEmail)(user.email, url, "درخواست برای ریست کردن رمز عبور");
            }
            catch (err) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                yield user.save({ validateBeforeSave: false });
                throw new internal_server_error_1.InternalServerError("در ارسال ایمیل خطایی روی داد. لطفا بعدا دوباره امتحان کنید!");
            }
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken) {
                throw new not_authorized_error_1.NotAuthorizedError("توکن تازه‌سازی ارائه نشده است");
            }
            const decoded = (yield (0, refreshToken_1.verifyRefreshToken)(refreshToken));
            const user = yield this.userRepository.findById(decoded.id);
            if (!user ||
                user.refreshToken !== refreshToken ||
                !user.refreshTokenExpires ||
                user.refreshTokenExpires < new Date()) {
                throw new not_authorized_error_1.NotAuthorizedError("توکن تازه‌سازی نامعتبر یا منقضی شده است");
            }
            if (!user.active) {
                throw new not_authorized_error_1.NotAuthorizedError("حساب کاربری غیرفعال است");
            }
            return user;
        });
    }
    resetPassword(resetPasswordDto, resetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = node_crypto_1.default
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");
            const user = yield this.userRepository.findByPasswordRestToken(token);
            if (!user) {
                throw new not_authorized_error_1.NotAuthorizedError("توکن نامعتبر است یا منقضی شده است!");
            }
            user.password = resetPasswordDto.password;
            user.passwordConfirmation =
                resetPasswordDto.passwordConfirmation;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            const updatedUser = yield user.save();
            return updatedUser;
        });
    }
}
exports.AuthService = AuthService;
