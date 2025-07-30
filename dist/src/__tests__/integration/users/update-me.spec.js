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
const users_helper_1 = require("@/__tests__/helpers/users.helper");
const core_1 = require("@/core");
let token;
let user;
const validationCases = [
    {
        description: "should return 400 if only email is provided but it is invalid",
        body: {
            email: "john.doe",
        },
        expectedError: "فرمت ایمیل کاربر معتبر نیست",
    },
    {
        description: "should return 400 if only name is provided but it is invalid",
        body: {
            name: "",
        },
        expectedError: "نام کاربر الزامی است",
    },
];
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    user = (0, auth_helper_1.getUniqueUser)("user1");
    const signupRes = yield (0, auth_helper_1.signupRequest)(user);
    token = signupRes.headers["set-cookie"][0];
}));
describe("PUT /api/users/update-me", () => {
    describe("should return 401, if", () => {
        it("No token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.updateMeRequest)("", {
                email: "newemail@test.com",
                photo: "https://pic.com",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("Token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.updateMeRequest)("jwt=invalid-token", {
                email: "newemail@test.com",
                photo: "https://pic.com",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("User for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, users_helper_1.updateMeRequest)(`jwt=${fakeToken}`, {
                email: "newemail@test.com",
                photo: "https://pic.com",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
        it("User is inactive", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("inactive");
            const signupRes = yield (0, auth_helper_1.signupRequest)(user);
            const cookie = signupRes.headers["set-cookie"][0];
            const repoUser = yield core_1.userRepository.findByEmail(user.email);
            repoUser.active = false;
            yield repoUser.save({ validateBeforeSave: false });
            const res = yield (0, users_helper_1.updateMePasswordRequest)(cookie, {
                passwordCurrent: "password",
                password: "newpassword",
                passwordConfirmation: "newpassword",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
    });
    describe("should return 400, if", () => {
        validationCases.forEach(({ description, body, expectedError }) => {
            it(description, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, users_helper_1.updateMeRequest)(token, body);
                expect(res.status).toBe(400);
                expect(res.body.errors).toBeDefined();
                expect(res.body.errors[0].message).toBe(expectedError);
            }));
        });
    });
    describe("should return 422, if", () => {
        it("Password and passwordConfirmation are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.updateMeRequest)(token, {
                password: "newpassword",
                passwordConfirmation: "newpassword",
            });
            expect(res.status).toBe(422);
            expect(res.body.errors[0].message).toBe("با این درخواست نمی توانید رمز عبور را آپدیت کنید");
        }));
    });
    describe("should return 200, if", () => {
        it("Name, email and photo are updated successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.updateMeRequest)(token, {
                email: "newemail@test.com",
                photo: "https://pic.com",
            });
            expect(res.status).toBe(200);
            expect(res.body.data.updatedUser.email).toBe("newemail@test.com");
            expect(res.body.data.updatedUser.photo).toBe("https://pic.com");
        }));
    });
});
