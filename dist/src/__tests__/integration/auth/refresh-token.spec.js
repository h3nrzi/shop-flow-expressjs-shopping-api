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
describe("POST /api/users/refresh-token", () => {
    describe("should return 401, if", () => {
        it("No refresh token provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, auth_helper_1.refreshTokenRequest)();
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("توکن تازه‌سازی ارائه نشده است");
        }));
        it("Invalid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, auth_helper_1.refreshTokenRequest)("refreshToken=invalid-token");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("توکن تازه‌سازی معتبر نیست");
        }));
        it("User is inactive", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("refresh");
            yield (0, auth_helper_1.signupRequest)(user);
            const loginRes = yield (0, auth_helper_1.loginRequest)(user);
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            userDoc.active = false;
            yield userDoc.save({ validateBeforeSave: false });
            const refreshCookie = loginRes.headers["set-cookie"][1];
            const res = yield (0, auth_helper_1.refreshTokenRequest)(refreshCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("حساب کاربری غیرفعال است");
        }));
        it("Refresh token expired", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("expired");
            yield (0, auth_helper_1.signupRequest)(user);
            const loginRes = yield (0, auth_helper_1.loginRequest)(user);
            const userDoc = yield core_1.userRepository.findByEmail(user.email);
            userDoc.refreshTokenExpires = new Date(Date.now() - 1000);
            yield userDoc.save({ validateBeforeSave: false });
            const refreshCookie = loginRes.headers["set-cookie"][1];
            const res = yield (0, auth_helper_1.refreshTokenRequest)(refreshCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("توکن تازه‌سازی نامعتبر یا منقضی شده است");
        }));
    });
    describe("should return 200, if", () => {
        it("Valid refresh token provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("valid");
            yield (0, auth_helper_1.signupRequest)(user);
            const loginRes = yield (0, auth_helper_1.loginRequest)(user);
            const refreshCookie = loginRes.headers["set-cookie"][1];
            const res = yield (0, auth_helper_1.refreshTokenRequest)(refreshCookie);
            expect(res.status).toBe(200);
            expect(res.body.status).toBe("success");
            expect(res.body.data.user).toBeDefined();
            expect(res.headers["set-cookie"]).toBeDefined();
            expect(res.headers["x-auth-token"]).toBeDefined();
        }));
    });
});
