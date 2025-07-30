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
const validationCases = [
    {
        description: "If the id is invalid",
        userId: "invalid-id",
        body: { name: "new name" },
        status: 400,
        error: "شناسه کاربر معتبر نیست",
    },
    {
        description: "If the name is not a string",
        body: { name: 123 },
        status: 400,
        error: "فرمت نام کاربر معتبر نیست",
    },
    {
        description: "If the email is not valid",
        body: { email: "not-an-email" },
        status: 400,
        error: "فرمت ایمیل کاربر معتبر نیست",
    },
    {
        description: "If the photo is not a string",
        body: { photo: 123 },
        status: 400,
        error: "فرمت تصویر کاربر معتبر نیست",
    },
    {
        description: "If the active is not a boolean",
        body: { active: "yes" },
        status: 400,
        error: "فرمت وضعیت کاربر معتبر نیست",
    },
];
let userCookie;
let adminCookie;
let mainAdminCookie;
let userId;
let adminId;
let mainAdminId;
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_helper_1.getUniqueUser)("user");
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
describe("PATCH /api/users/:id", () => {
    describe("should return 401", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)("", userId, {
                name: "new name",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)("jwt=invalid-token", userId, { name: "new name" });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, admin_helper_1.updateUserRequest)(`jwt=${fakeToken}`, userId, { name: "new name" });
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
            const res = yield (0, admin_helper_1.updateUserRequest)(cookie, userId, {
                name: "new name",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("If user's role is not admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(userCookie, userId, {
                name: "new name",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما اجازه انجام این عمل را ندارید!");
        }));
        it("If an admin tries to update another admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(adminCookie, adminId, {
                name: "Hacker",
            });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
        }));
        it("If an admin tries to update the main admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(adminCookie, mainAdminId, { name: "Hacker" });
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد");
        }));
    });
    describe("should return 400", () => {
        validationCases.forEach(testCase => {
            it(testCase.description, () => __awaiter(void 0, void 0, void 0, function* () {
                const id = testCase.userId || userId;
                const res = yield (0, admin_helper_1.updateUserRequest)(adminCookie, id, testCase.body);
                expect(res.status).toBe(testCase.status);
                expect(res.body.errors[0].message).toBe(testCase.error);
            }));
        });
        it("If the email is already in use", () => __awaiter(void 0, void 0, void 0, function* () {
            const admin = (0, auth_helper_1.getUniqueUser)("going-to-be-admin");
            yield (0, auth_helper_1.signupRequest)(admin);
            const admin2Doc = yield core_1.userRepository.findByEmail(admin.email);
            admin2Doc.role = "admin";
            yield admin2Doc.save({ validateBeforeSave: false });
            const adminId2 = admin2Doc._id.toString();
            const res = yield (0, admin_helper_1.updateUserRequest)(mainAdminCookie, adminId2, { email: "admin@gmail.com" });
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("این ایمیل قبلا استفاده شده است");
        }));
    });
    describe("should return 404", () => {
        it("If the user does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = new mongoose_1.default.Types.ObjectId();
            const res = yield (0, admin_helper_1.updateUserRequest)(adminCookie, nonExistentId.toString(), { name: "new name" });
            expect(res.status).toBe(404);
            expect(res.body.errors[0].message).toBe("هیچ موردی با این شناسه یافت نشد");
        }));
    });
    describe("should return 200", () => {
        it("If admin wants to update a normal user", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(adminCookie, userId, {
                name: "Updated Name",
            });
            expect(res.status).toBe(200);
            expect(res.body.data.user).toBeDefined();
        }));
        it("If main admin wants to update another admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(mainAdminCookie, adminId, { name: "Admin Updated" });
            expect(res.status).toBe(200);
            expect(res.body.data.user).toBeDefined();
        }));
        it("If main admin wants to update himself", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.updateUserRequest)(mainAdminCookie, mainAdminId, { name: "Main Admin Updated" });
            expect(res.status).toBe(200);
            expect(res.body.data.user).toBeDefined();
        }));
    });
});
