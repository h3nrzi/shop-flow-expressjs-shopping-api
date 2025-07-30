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
const not_authorized_error_1 = require("../errors/not-authorized-error");
const forbidden_error_1 = require("../errors/forbidden-error");
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const core_1 = require("../core");
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    let token = undefined;
    if (authorization && authorization.startsWith("Bearer"))
        token = authorization.split(" ")[1];
    else if (req.cookies.jwt)
        token = req.cookies.jwt;
    if (!token) {
        throw new not_authorized_error_1.NotAuthorizedError("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
    }
    const decoded = (yield (0, verifyToken_1.default)(token));
    const user = yield core_1.userRepository.findById(decoded.id);
    if (!user) {
        const msg = "کاربر متعلق به این توکن دیگر وجود ندارد!";
        throw new not_authorized_error_1.NotAuthorizedError(msg);
    }
    if (!user.active) {
        const msg = "کاربری که به این ایمیل مرتبط است غیرفعال شده!";
        throw new not_authorized_error_1.NotAuthorizedError(msg);
    }
    if (user.changePasswordAfter(decoded.iat)) {
        const msg = "کاربر اخیرا رمز عبور را تغییر داده است! لطفا دوباره وارد شوید.";
        throw new not_authorized_error_1.NotAuthorizedError(msg);
    }
    req.user = user;
    return next();
});
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new forbidden_error_1.ForbiddenError("شما اجازه انجام این عمل را ندارید!");
        }
        return next();
    };
};
const authMiddleware = { protect, restrictTo };
exports.default = authMiddleware;
