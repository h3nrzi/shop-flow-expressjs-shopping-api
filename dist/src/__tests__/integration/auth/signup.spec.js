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
const validationCases = [
    {
        testCaseName: "Name is not provided",
        user: {
            name: "",
            email: "test@test.com",
            password: "password",
            passwordConfirmation: "password",
        },
        error: "نام کاربر الزامی است",
    },
    {
        testCaseName: "Email is not provided",
        user: {
            name: "test",
            email: "",
            password: "password",
            passwordConfirmation: "password",
        },
        error: "ایمیل کاربر الزامی است",
    },
    {
        testCaseName: "Password is not provided",
        user: {
            name: "test",
            email: "test@test.com",
            password: "",
            passwordConfirmation: "password",
        },
        error: "رمز عبور کاربر الزامی است",
    },
    {
        testCaseName: "Password confirmation is not provided",
        user: {
            name: "test",
            email: "test@test.com",
            password: "password",
            passwordConfirmation: "",
        },
        error: "تایید رمز عبور کاربر الزامی است",
    },
];
describe("POST /api/users/signup", () => {
    describe("should return 400, if", () => {
        validationCases.forEach(({ testCaseName, user, error }) => {
            it(testCaseName, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, auth_helper_1.signupRequest)(user);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(error);
            }));
        });
        it("Email is already in use", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            yield (0, auth_helper_1.signupRequest)(user);
            const res = yield (0, auth_helper_1.signupRequest)(user);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("این ایمیل قبلا استفاده شده است");
        }));
    });
    describe("should return 201, if", () => {
        it("Signup is successful", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            const res = yield (0, auth_helper_1.signupRequest)(user);
            expect(res.status).toBe(201);
            expect(res.headers["set-cookie"]).toBeDefined();
        }));
    });
});
