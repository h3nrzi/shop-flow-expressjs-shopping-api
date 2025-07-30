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
const uploads_helper_1 = require("@/__tests__/helpers/uploads.helper");
jest.mock("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: "https://res.cloudinary.com/test/image/upload/v1234567890/Azooghe/test.jpg",
                public_id: "Azooghe/test",
            }),
        },
    },
}));
describe("POST /api/uploads", () => {
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, uploads_helper_1.createTestUserAndGetCookie)("uploader");
        cookie = testUser.cookie;
    }));
    describe("should return 401, if", () => {
        it("user is not authenticated (no token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, "test.png", "image/png");
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("شما وارد نشده اید! لطفا برای دسترسی وارد شوید");
        }));
        it("user is not authenticated (invalid token)", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const invalidCookie = `jwt=${(0, auth_helper_1.getInvalidToken)()}`;
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, "test.png", "image/png", invalidCookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("should return 201, if", () => {
        it("no file is provided (controller doesn't validate)", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, uploads_helper_1.uploadImageRequest)(undefined, undefined, undefined, cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
        }));
    });
    describe("should return 400, if", () => {
        const invalidFiles = (0, uploads_helper_1.getInvalidImageFiles)();
        invalidFiles.forEach(({ buffer, filename, mimetype, description, expectedError, }) => {
            it(`file is ${description}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, uploads_helper_1.uploadImageRequest)(buffer, filename, mimetype, cookie);
                expect(res.status).toBe(400);
                expect(res.body.errors[0].message).toBe(expectedError);
            }));
        });
    });
    describe("should return 201, if", () => {
        const validFiles = (0, uploads_helper_1.getValidImageFiles)();
        validFiles.forEach(({ buffer, filename, mimetype, description }) => {
            it(`upload is successful with ${description}`, () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, uploads_helper_1.uploadImageRequest)(buffer, filename, mimetype, cookie);
                expect(res.status).toBe(201);
                expect(res.body.status).toBe("success");
                expect(res.body.data.image).toBeDefined();
                expect(res.body.data.image).toMatch(/^https:\/\/res\.cloudinary\.com/);
            }));
        });
        it("upload is successful and returns correct response structure", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("status", "success");
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("image");
            expect(typeof res.body.data.image).toBe("string");
            expect(res.body.data.image).toContain("cloudinary.com");
        }));
    });
    describe("should handle edge cases", () => {
        it("should handle large file names", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const longFilename = "a".repeat(200) + ".png";
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, longFilename, "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
        }));
        it("should handle files with special characters in name", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const specialFilename = "test-file_123.png";
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, specialFilename, "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
        }));
        it("should handle webp images", () => __awaiter(void 0, void 0, void 0, function* () {
            const validImageBuffer = (0, uploads_helper_1.createValidImageBuffer)();
            const res = yield (0, uploads_helper_1.uploadImageRequest)(validImageBuffer, "test.webp", "image/webp", cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
        }));
    });
});
