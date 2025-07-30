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
const products_helper_1 = require("@/__tests__/helpers/products.helper");
const core_1 = require("@/core");
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
describe("POST /api/admin/products", () => {
    describe("should return 401", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.createProductRequest)("", products_helper_1.validProduct);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.createProductRequest)("jwt=invalid-token", products_helper_1.validProduct);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, admin_helper_1.createProductRequest)(`jwt=${fakeToken}`, products_helper_1.validProduct);
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
            const res = yield (0, admin_helper_1.createProductRequest)(cookie, products_helper_1.validProduct);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("If user's role is not admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.createProductRequest)(userCookie, products_helper_1.validProduct);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما اجازه انجام این عمل را ندارید!");
        }));
    });
    describe("should return 201", () => {
        it("If user is admin", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, admin_helper_1.createProductRequest)(adminCookie, products_helper_1.validProduct);
            expect(res.status).toBe(201);
            expect(res.body.data.product).toBeDefined();
        }));
    });
});
