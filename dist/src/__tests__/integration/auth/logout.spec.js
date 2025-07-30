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
describe("POST /api/users/logout", () => {
    describe("should return 204, if", () => {
        it("Logout is successful", () => __awaiter(void 0, void 0, void 0, function* () {
            const user = (0, auth_helper_1.getUniqueUser)("user");
            const signupResponse = yield (0, auth_helper_1.signupRequest)(user);
            const logoutResponse = yield (0, auth_helper_1.logoutRequest)(signupResponse.headers["set-cookie"]);
            expect(logoutResponse.status).toBe(204);
            const cookie = logoutResponse.headers["set-cookie"];
            const result = cookie === null || cookie === void 0 ? void 0 : cookie[0].split(";")[0];
            expect(result).toBe("jwt=");
        }));
    });
});
