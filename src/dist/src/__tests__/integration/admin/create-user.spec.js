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
const admin_helper_1 = require("@/__tests__/helpers/admin.helper");
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const core_1 = require("@/core");
const validationCases = [
    {
        description: "If the name is not provided",
        body: {
            name: "",
            email: "test@test.com",
            password: "password",
            passwordConfirmation: "password",
        },
        error: "نام کاربر الزامی است",
        field: "name",
    },
    {
        description: "If the request body is invalid",
        body: {
            name: "test",
            email: "",
            password: "password",
            passwordConfirmation: "password",
        },
        error: "ایمیل کاربر الزامی است",
        field: "email",
    },
    {
        description: "If the password is not provided",
        body: {
            name: "test",
            email: "test@test.com",
            password: "",
            passwordConfirmation: "password",
        },
        error: "رمز عبور کاربر الزامی است",
        field: "password",
    },
    {
        description: "If the password confirmation is not provided",
        body: {
            name: "test",
            email: "test@test.com",
            password: "password",
            passwordConfirmation: "",
        },
        error: "تایید رمز عبور کاربر الزامی است",
        field: "passwordConfirmation",
    },
    {
        description: "If the password and password confirmation do not match",
        body: {
            name: "test",
            email: "test@test.com",
            password: "password",
            passwordConfirmation: "password1",
        },
        error: "رمز عبور و تایید رمز عبور باید یکسان باشد",
        field: "passwordConfirmation",
    },
];
let userCookie;
let adminCookie;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_helper_1.getUniqueUser)("user");
    const res = yield (0, auth_helper_1.signupRequest)(user);
    userCookie = res.headers["set-cookie"][0];
    const admin = (0, auth_helper_1.getUniqueUser)("admin");
    const adminRes = yield (0, auth_helper_1.signupRequest)(admin);
    adminCookie = adminRes.headers["set-cookie"][0];
    const adminUser = yield core_1.userRepository.findByEmail(admin.email);
    adminUser.role = "admin";
    yield adminUser.save({ validateBeforeSave: false });
}));
describe("POST /api/users", () => {
    describe("should return 401", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = (0, auth_helper_1.getUniqueUser)("new-user");
            const res = yield (0, admin_helper_1.createUserRequest)("", newUser);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            const res = yield (0, admin_helper_1.createUserRequest)("jwt=invalid-token", user);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const user = (0, auth_helper_1.getUniqueUser)("user");
            const res = yield (0, admin_helper_1.createUserRequest)(`jwt=${fakeToken}`, user);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
        it("If user is inactive", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("inactive");
            const signupRes = yield (0, auth_helper_1.signupRequest)(user);
            const cookie = signupRes.headers["set-cookie"][0];
            const repoUser = yield core_1.userRepository.findByEmail(user.email);
            repoUser.active = false;
            yield repoUser.save({ validateBeforeSave: false });
            const res = yield (0, admin_helper_1.createUserRequest)(cookie, user);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("If user is not an admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = (0, auth_helper_1.getUniqueUser)("new-user");
            const res = yield (0, admin_helper_1.createUserRequest)(userCookie, newUser);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما اجازه انجام این عمل را ندارید!");
        }));
    });
    describe("should return 400", () => {
        validationCases.forEach(({ description, body, error, field }) => {
            it(description, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, admin_helper_1.createUserRequest)(adminCookie, body);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].field).toBe(field);
                expect(res.body.errors[0].message).toBe(error);
            }));
        });
        it("If the email is already in use", () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = (0, auth_helper_1.getUniqueUser)("new-user");
            yield (0, admin_helper_1.createUserRequest)(adminCookie, newUser);
            const res = yield (0, admin_helper_1.createUserRequest)(adminCookie, newUser);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("این ایمیل قبلا استفاده شده است");
        }));
    });
    describe("should return 201", () => {
        it("If user is admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = (0, auth_helper_1.getUniqueUser)("new-user");
            const res = yield (0, admin_helper_1.createUserRequest)(adminCookie, newUser);
            expect(res.status).toBe(201);
            expect(res.body.data.user).toBeDefined();
        }));
    });
});
