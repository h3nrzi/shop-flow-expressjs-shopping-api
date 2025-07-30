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
const admin_helper_1 = require("@/__tests__/helpers/admin.helper");
const auth_helper_1 = require("@/__tests__/helpers/auth.helper");
const core_1 = require("@/core");
const mongoose_1 = __importDefault(require("mongoose"));
let user;
let userCookie;
let adminCookie;
let mainAdminCookie;
let userId;
let adminId;
let mainAdminId;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    user = (0, auth_helper_1.getUniqueUser)("user");
    const userRes = yield (0, auth_helper_1.signupRequest)(user);
    userCookie = userRes.headers["set-cookie"][0];
    const userDoc = yield core_1.userRepository.findByEmail(user.email);
    userId = userDoc._id.toString();
    const admin = (0, auth_helper_1.getUniqueUser)("admin");
    const adminRes = yield (0, auth_helper_1.signupRequest)(admin);
    adminCookie = adminRes.headers["set-cookie"][0];
    const adminUser = yield core_1.userRepository.findByEmail(admin.email);
    adminUser.role = "admin";
    yield adminUser.save({ validateBeforeSave: false });
    adminId = adminUser._id.toString();
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
    mainAdminId = mainAdminUser._id.toString();
}));
describe("DELETE /api/users/:id", () => {
    describe("should return 401", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)("", userId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)("jwt=invalid-token", userId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, admin_helper_1.deleteUserRequest)(`jwt=${fakeToken}`, userId);
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
            const res = yield (0, admin_helper_1.deleteUserRequest)(cookie, userId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("If user's role is not admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(userCookie, userId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما اجازه انجام این عمل را ندارید!");
        }));
        it("If an admin tries to delete another admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(adminCookie, adminId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
        }));
        it("If an admin tries to delete the main admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(adminCookie, mainAdminId);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
        }));
    });
    describe("should return 400", () => {
        it("If userId is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(adminCookie, "invalid-id");
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("شناسه کاربر معتبر نیست");
        }));
    });
    describe("should return 404", () => {
        it("If user does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = new mongoose_1.default.Types.ObjectId().toString();
            const res = yield (0, admin_helper_1.deleteUserRequest)(adminCookie, nonExistentId);
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("هیچ موردی با این شناسه یافت نشد");
        }));
    });
    describe("should return 204", () => {
        it("If user is admin and wants to delete a normal user", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(adminCookie, userId);
            expect(res.status).toBe(204);
            const deletedUser = yield core_1.userRepository.findByEmail(user.email);
            expect(deletedUser).toBeNull();
        }));
        it("If user is main admin and wants to delete an normal admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(mainAdminCookie, adminId);
            expect(res.status).toBe(204);
            const deletedAdmin = yield core_1.userRepository.findByEmail(`testadmin@test.com`);
            expect(deletedAdmin).toBeNull();
        }));
        it("If user is main admin and wants to delete the main admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.deleteUserRequest)(mainAdminCookie, mainAdminId);
            expect(res.status).toBe(204);
            const deletedMainAdmin = yield core_1.userRepository.findByEmail("admin@gmail.com");
            expect(deletedMainAdmin).toBeNull();
        }));
    });
});
