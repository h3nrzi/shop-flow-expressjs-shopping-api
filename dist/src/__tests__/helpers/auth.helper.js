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
exports.signupAndRequestForgotPassword = exports.getUniqueUser = exports.getInvalidToken = exports.refreshTokenRequest = exports.resetPasswordRequest = exports.forgotPasswordRequest = exports.logoutRequest = exports.loginRequest = exports.signupRequest = void 0;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("@/app"));
const email_1 = require("@/utils/email");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const signupRequest = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).post("/api/users/signup").send(body);
});
exports.signupRequest = signupRequest;
const loginRequest = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).post("/api/users/login").send(body);
});
exports.loginRequest = loginRequest;
const logoutRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).post("/api/users/logout").set("Cookie", cookie);
});
exports.logoutRequest = logoutRequest;
const forgotPasswordRequest = (body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).post("/api/users/forgot-password").send(body);
});
exports.forgotPasswordRequest = forgotPasswordRequest;
const resetPasswordRequest = (body, query) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .patch(`/api/users/reset-password?resetToken=${query.resetToken}`)
        .send(body);
});
exports.resetPasswordRequest = resetPasswordRequest;
const refreshTokenRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    const req = (0, supertest_1.default)(app_1.default).post("/api/users/refresh-token");
    if (cookie)
        req.set("Cookie", cookie);
    return yield req.send();
});
exports.refreshTokenRequest = refreshTokenRequest;
const getInvalidToken = () => {
    const id = new mongoose_1.default.Types.ObjectId().toString();
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
exports.getInvalidToken = getInvalidToken;
const getUniqueUser = (suffix) => ({
    name: "test",
    email: `test${suffix}@test.com`,
    password: "test123456",
    passwordConfirmation: "test123456",
});
exports.getUniqueUser = getUniqueUser;
const signupAndRequestForgotPassword = (user) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.signupRequest)(user);
    yield (0, exports.forgotPasswordRequest)({ email: user.email });
    const mockSendEmail = email_1.sendEmail;
    const emailCall = mockSendEmail.mock.calls[0];
    const url = emailCall[1];
    return url.split("/").pop();
});
exports.signupAndRequestForgotPassword = signupAndRequestForgotPassword;
