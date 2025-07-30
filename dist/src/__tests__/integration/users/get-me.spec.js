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
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const user = (0, auth_helper_1.getUniqueUser)("user1");
    const signupRes = yield (0, auth_helper_1.signupRequest)(user);
    token = signupRes.headers["set-cookie"][0];
}));
describe("GET /api/users/get-me", () => {
    describe("should return 401, if", () => {
        it("If no token is provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.getMeRequest)("");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("If token is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.getMeRequest)("jwt=invalid-token");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("توکن معتبر نیست");
        }));
        it("If user for token does not exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakeToken = (0, auth_helper_1.getInvalidToken)();
            const res = yield (0, users_helper_1.getMeRequest)(`jwt=${fakeToken}`);
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
            const res = yield (0, users_helper_1.getMeRequest)(cookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].field).toBeNull();
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
    });
    describe("should return 200, if", () => {
        it("User is authenticated", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, users_helper_1.getMeRequest)(token);
            expect(res.status).toBe(200);
        }));
    });
});
