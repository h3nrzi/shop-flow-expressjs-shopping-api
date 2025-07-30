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
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const core_1 = require("@/core");
const email_1 = require("@/utils/email");
const validationCases = [
    {
        testCaseName: "Password is not provided",
        body: { password: "", passwordConfirmation: "test123456" },
        query: { resetToken: "123456" },
        error: "رمز عبور کاربر الزامی است",
    },
    {
        testCaseName: "Password confirmation is not provided",
        body: { password: "test123456", passwordConfirmation: "" },
        query: { resetToken: "123456" },
        error: "تایید رمز عبور کاربر الزامی است",
    },
    {
        testCaseName: "Password and password confirmation are not the same",
        body: {
            password: "test123456",
            passwordConfirmation: "1234567",
        },
        query: { resetToken: "123456" },
        error: "رمز عبور و تایید رمز عبور باید یکسان باشد",
    },
    {
        testCaseName: "Reset token is not provided",
        body: {
            password: "test123456",
            passwordConfirmation: "test123456",
        },
        query: { resetToken: "" },
        error: "ریست توکن کاربر الزامی است",
    },
];
describe("PATCH /api/users/reset-password", () => {
    beforeEach(() => {
        email_1.sendEmail.mockClear();
    });
    describe("should return 400, if", () => {
        validationCases.forEach(({ testCaseName, body, query, error }) => {
            it(testCaseName, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, auth_helper_1.resetPasswordRequest)(body, query);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(error);
            }));
        });
    });
    describe("should return 401, if", () => {
        it("Reset token is not valid", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("test1");
            yield (0, auth_helper_1.signupAndRequestForgotPassword)(user);
            const res = yield (0, auth_helper_1.resetPasswordRequest)({
                password: "test123456",
                passwordConfirmation: "test123456",
            }, { resetToken: "invalid-token" });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("توکن نامعتبر است یا منقضی شده است!");
        }));
        it("Reset token is expired", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("test2");
            const resetToken = yield (0, auth_helper_1.signupAndRequestForgotPassword)(user);
            const dbUser = yield core_1.userRepository.findByEmail(user.email);
            dbUser.passwordResetExpires = Date.now() - 1000;
            yield dbUser.save({ validateBeforeSave: false });
            const res = yield (0, auth_helper_1.resetPasswordRequest)({
                password: "test123456",
                passwordConfirmation: "test123456",
            }, { resetToken });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("توکن نامعتبر است یا منقضی شده است!");
        }));
        it("Login with the old password is unsuccessful", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("test4");
            const resetToken = yield (0, auth_helper_1.signupAndRequestForgotPassword)(user);
            const newPassword = "newpassword123";
            yield (0, auth_helper_1.resetPasswordRequest)({
                password: newPassword,
                passwordConfirmation: newPassword,
            }, { resetToken });
            const oldLoginRes = yield (0, auth_helper_1.loginRequest)({
                email: user.email,
                password: user.password,
            });
            expect(oldLoginRes.status).toBe(401);
            expect(oldLoginRes.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
        }));
    });
    describe("should return 200, if", () => {
        it("Reset password is successful", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("test3");
            const resetToken = yield (0, auth_helper_1.signupAndRequestForgotPassword)(user);
            const newPassword = "newpassword123";
            const resetPasswordRes = yield (0, auth_helper_1.resetPasswordRequest)({
                password: newPassword,
                passwordConfirmation: newPassword,
            }, { resetToken });
            expect(resetPasswordRes.status).toBe(200);
        }));
        it("Login with the new password is successful", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("test2");
            const resetToken = yield (0, auth_helper_1.signupAndRequestForgotPassword)(user);
            const newPassword = "newpassword123";
            yield (0, auth_helper_1.resetPasswordRequest)({
                password: newPassword,
                passwordConfirmation: newPassword,
            }, { resetToken });
            const loginRes = yield (0, auth_helper_1.loginRequest)({
                email: user.email,
                password: newPassword,
            });
            expect(loginRes.status).toBe(200);
        }));
    });
});
