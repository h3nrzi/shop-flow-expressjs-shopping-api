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
exports.deleteMeRequest = exports.updateMePasswordRequest = exports.updateMeRequest = exports.getMeRequest = void 0;
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("@/app"));
const getMeRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).get("/api/users/get-me").set("Cookie", cookie);
});
exports.getMeRequest = getMeRequest;
const updateMeRequest = (cookie, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .patch("/api/users/update-me")
        .set("Cookie", cookie)
        .send(body);
});
exports.updateMeRequest = updateMeRequest;
const updateMePasswordRequest = (cookie, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .patch("/api/users/update-me-password")
        .set("Cookie", cookie)
        .send(body);
});
exports.updateMePasswordRequest = updateMePasswordRequest;
const deleteMeRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .delete("/api/users/delete-me")
        .set("Cookie", cookie);
});
exports.deleteMeRequest = deleteMeRequest;
