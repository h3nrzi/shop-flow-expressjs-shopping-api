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
        testCaseName: "Email is not provided",
        body: { email: "" },
        error: "ایمیل کاربر الزامی است",
    },
    {
        testCaseName: "Email is not valid",
        body: { email: "user@test" },
        error: "فرمت ایمیل وارد شده معتبر نیست",
    },
];
describe("POST /api/users/forgot-password", () => {
    describe("should return 400, if", () => {
        validationCases.forEach(({ testCaseName, body, error }) => {
            it(testCaseName, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, auth_helper_1.forgotPasswordRequest)(body);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(error);
            }));
        });
    });
    describe("should return 404, if", () => {
        it("User is not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, auth_helper_1.forgotPasswordRequest)({
                email: "test@test.com",
            });
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("هیچ کاربری با این آدرس ایمیل وجود ندارد.");
        }));
    });
    describe("should return 401, if", () => {
        it("User is not active", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            userDoc.active = false;
            yield userDoc.save({ validateBeforeSave: false });
            const res = yield (0, auth_helper_1.forgotPasswordRequest)({
                email: user.email,
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است مسدود شده است!");
        }));
    });
    describe("should return 200, if", () => {
        it("User is found and active and email is valid", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const res = yield (0, auth_helper_1.forgotPasswordRequest)({
                email: user.email,
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("ایمیل بازیابی رمز عبور با موفقیت ارسال شد");
            expect(email_1.sendEmail).toHaveBeenCalledWith(user.email, expect.any(String), "درخواست برای ریست کردن رمز عبور");
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            expect(userDoc.passwordResetToken).toBeDefined();
            expect(userDoc.passwordResetExpires).toBeDefined();
        }));
    });
});
