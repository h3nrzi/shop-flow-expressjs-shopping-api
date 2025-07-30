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
let user;
let userCookie;
let adminCookie;
let mainAdminCookie;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    user = (0, auth_helper_1.getUniqueUser)("user");
    const userRes = yield (0, auth_helper_1.signupRequest)(user);
    userCookie = userRes.headers["set-cookie"][0];
    const admin = (0, auth_helper_1.getUniqueUser)("admin");
    const adminRes = yield (0, auth_helper_1.signupRequest)(admin);
    adminCookie = adminRes.headers["set-cookie"][0];
    const adminUser = yield core_1.userRepository.findByEmail(admin.email);
    adminUser.role = "admin";
    yield adminUser.save({ validateBeforeSave: false });
    const mainAdmin = {
        name: "Main Admin",
        email: "admin@gmail.com",
        password: "test123456",
        passwordConfirmation: "test123456",
    };
    const mainAdminRes = yield (0, auth_helper_1.signupRequest)(mainAdmin);
    mainAdminCookie = mainAdminRes.headers["set-cookie"][0];
    const mainAdminUser = yield core_1.userRepository.findByEmail(mainAdmin.email);
    mainAdminUser.role = "admin";
    yield mainAdminUser.save({ validateBeforeSave: false });
}));
const validationCases = [
    {
        description: "If the period is invalid",
        params: { period: "invalid" },
        expectedMessage: "زمان وارد شده نامعتبر است",
    },
];
describe("GET /api/users/get-users-count", () => {
    describe("should return 401", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)("", "week");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)("jwt=invalid-token", "week");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(`jwt=${fakeToken}`, "week");
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
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(cookie, "week");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("If user's role is not admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(userCookie, "week");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما اجازه انجام این عمل را ندارید!");
        }));
    });
    describe("should return 400", () => {
        validationCases.forEach(({ description, params, expectedMessage }) => {
            it(description, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(adminCookie, params.period);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(expectedMessage);
            }));
        });
    });
    describe("should return 200", () => {
        it("For week", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(adminCookie, "week");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.usersCountByDay)).toBe(true);
        }));
        it("For month", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(adminCookie, "month");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.usersCountByDay)).toBe(true);
        }));
        it("For year", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(adminCookie, "year");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.usersCountByDay)).toBe(true);
        }));
        it("For all", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(adminCookie, "all");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.usersCountByDay)).toBe(true);
        }));
        it("For main admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.getUsersCountByDayRequest)(mainAdminCookie, "week");
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data.usersCountByDay)).toBe(true);
        }));
    });
});
