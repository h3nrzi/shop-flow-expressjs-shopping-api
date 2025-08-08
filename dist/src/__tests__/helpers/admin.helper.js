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
exports.createProductRequest = exports.getUsersCountByDayRequest = exports.deleteUserRequest = exports.updateUserRequest = exports.createUserRequest = exports.getUserRequest = exports.allUsersRequest = void 0;
const app_1 = __importDefault(require("@/app"));
const supertest_1 = __importDefault(require("supertest"));
const allUsersRequest = (cookie) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).get("/api/users").set("Cookie", cookie);
});
exports.allUsersRequest = allUsersRequest;
const getUserRequest = (cookie, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).get(`/api/users/${userId}`).set("Cookie", cookie);
});
exports.getUserRequest = getUserRequest;
const createUserRequest = (cookie, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default).post("/api/users").set("Cookie", cookie).send(body);
});
exports.createUserRequest = createUserRequest;
const updateUserRequest = (cookie, userId, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .patch(`/api/users/${userId}`)
        .set("Cookie", cookie)
        .send(body);
});
exports.updateUserRequest = updateUserRequest;
const deleteUserRequest = (cookie, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .delete(`/api/users/${userId}`)
        .set("Cookie", cookie);
});
exports.deleteUserRequest = deleteUserRequest;
const getUsersCountByDayRequest = (cookie, period) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "/api/users/get-users-count";
    if (period)
        url += `?period=${period}`;
    return yield (0, supertest_1.default)(app_1.default).get(url).set("Cookie", cookie);
});
exports.getUsersCountByDayRequest = getUsersCountByDayRequest;
const createProductRequest = (cookie, body) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, supertest_1.default)(app_1.default)
        .post("/api/products")
        .set("Cookie", cookie)
        .send(body);
});
exports.createProductRequest = createProductRequest;
