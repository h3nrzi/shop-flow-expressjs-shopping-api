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
const validationCases = [
    {
        testCaseName: "Email is not provided",
        body: {
            email: "",
            password: "password",
        },
        error: "ایمیل کاربر الزامی است",
    },
    {
        testCaseName: "Email is not valid",
        body: {
            email: "user@test",
            password: "password",
        },
        error: "فرمت ایمیل وارد شده معتبر نیست",
    },
    {
        testCaseName: "Password is not provided",
        body: {
            email: "test@test.com",
            password: "",
        },
        error: "رمز عبور کاربر الزامی است",
    },
    {
        testCaseName: "Password is not valid",
        body: {
            email: "test@test.com",
            password: 123,
        },
        error: "فرمت رمز عبور کاربر باید string باشد",
    },
];
describe("POST /api/users/signin", () => {
    describe("should return 400, if", () => {
        validationCases.forEach(({ testCaseName, body, error }) => {
            it(testCaseName, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, auth_helper_1.loginRequest)(body);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(error);
            }));
        });
    });
    describe("should return 401, if", () => {
        it("User is not active", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            userDoc.active = false;
            yield userDoc.save({ validateBeforeSave: false });
            const res = yield (0, auth_helper_1.loginRequest)(user);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید.");
        }));
        it("User's credentials are incorrect (email)", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            const res = yield (0, auth_helper_1.loginRequest)(user);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
        }));
        it("User's credentials are incorrect (password)", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const res = yield (0, auth_helper_1.loginRequest)({
                email: user.email,
                password: "wrong-password",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("ایمیل یا رمز عبور اشتباه است!");
        }));
    });
    describe("should return 200, if", () => {
        it("Email is found, user is active and password is correct", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const res = yield (0, auth_helper_1.loginRequest)(user);
            expect(res.status).toBe(200);
            expect(res.headers["set-cookie"]).toBeDefined();
        }));
    });
});
