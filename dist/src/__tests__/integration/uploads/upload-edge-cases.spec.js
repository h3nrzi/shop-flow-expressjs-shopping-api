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
const uploads_helper_1 = require("@/__tests__/helpers/uploads.helper");
const core_1 = require("@/core");
const buffer_1 = require("buffer");
jest.mock("cloudinary", () => {
    const mockUpload = jest.fn().mockResolvedValue({
        secure_url: "https://res.cloudinary.com/test/image/upload/v1234567890/Azooghe/test.jpg",
        public_id: "Azooghe/test",
    });
    return {
        v2: {
            config: jest.fn(),
            uploader: {
                upload: mockUpload,
            },
        },
    };
});
const { v2: cloudinary } = require("cloudinary");
const mockCloudinaryUpload = cloudinary.uploader.upload;
describe("Upload Edge Cases and Error Handling", () => {
    let cookie;
    let user;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        mockCloudinaryUpload.mockReset();
        mockCloudinaryUpload.mockResolvedValue({
            secure_url: "https://res.cloudinary.com/test/image/upload/v1234567890/Azooghe/test.jpg",
            public_id: "Azooghe/test",
        });
        const testUser = yield (0, uploads_helper_1.createTestUserAndGetCookie)("edgecase");
        cookie = testUser.cookie;
        user = yield core_1.userRepository.findByEmail(testUser.user.email);
    }));
    describe("Cloudinary Service Errors", () => {
        it("should handle Cloudinary upload failure", () => __awaiter(void 0, void 0, void 0, function* () {
            mockCloudinaryUpload.mockRejectedValue(new Error("Cloudinary upload failed"));
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(500);
        }));
        it("should handle Cloudinary timeout", () => __awaiter(void 0, void 0, void 0, function* () {
            mockCloudinaryUpload.mockRejectedValue(new Error("Request timeout"));
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(500);
        }));
        it("should handle invalid Cloudinary response", () => __awaiter(void 0, void 0, void 0, function* () {
            mockCloudinaryUpload.mockResolvedValue({});
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.image).toBeUndefined();
        }));
    });
    describe("User State Edge Cases", () => {
        it("should handle inactive user", () => __awaiter(void 0, void 0, void 0, function* () {
            user.active = false;
            yield user.save({ validateBeforeSave: false });
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربری که به این ایمیل مرتبط است غیرفعال شده!");
        }));
        it("should handle deleted user", () => __awaiter(void 0, void 0, void 0, function* () {
            yield core_1.userRepository.delete(user._id);
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(401);
            expect(res.body.errors[0].message).toBe("کاربر متعلق به این توکن دیگر وجود ندارد!");
        }));
    });
    describe("File Processing Edge Cases", () => {
        it("should handle empty file buffer", () => __awaiter(void 0, void 0, void 0, function* () {
            const emptyBuffer = buffer_1.Buffer.alloc(0);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(emptyBuffer, "empty.png", "image/png", cookie);
            expect(res.status).toBe(201);
        }));
        it("should handle very large file names", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const veryLongName = "a".repeat(1000) + ".png";
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, veryLongName, "image/png", cookie);
            expect(res.status).toBe(201);
        }));
        it("should handle files with unicode characters in name", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "تست-عکس-۱۲۳.png", "image/png", cookie);
            expect(res.status).toBe(201);
        }));
        it("should handle case-insensitive file extensions", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const testCases = [
                { filename: "test.PNG", mimetype: "image/png" },
                { filename: "test.JPG", mimetype: "image/jpeg" },
                { filename: "test.JPEG", mimetype: "image/jpeg" },
                { filename: "test.WEBP", mimetype: "image/webp" },
            ];
            for (const { filename, mimetype } of testCases) {
                const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, filename, mimetype, cookie);
                expect(res.status).toBe(201);
            }
        }));
    });
    describe("Request Malformation", () => {
        it("should handle missing file field", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, uploads_helper_1.uploadImageRequest)(undefined, undefined, undefined, cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
        }));
        it("should handle corrupted multipart data", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([0x00, 0x01, 0x02]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "corrupted.png", "image/png", cookie);
            expect([200, 201, 400, 500]).toContain(res.status);
        }));
    });
    describe("Successful Upload Variations", () => {
        it("should successfully upload and return correct Cloudinary URL format", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body.status).toBe("success");
            expect(res.body.data.image).toMatch(/^https:\/\/res\.cloudinary\.com/);
            expect(res.body.data.image).toContain("Azooghe");
        }));
        it("should handle multiple file uploads in sequence", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            for (let i = 0; i < 3; i++) {
                const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, `test${i}.png`, "image/png", cookie);
                expect(res.status).toBe(201);
                expect(res.body.status).toBe("success");
            }
        }));
    });
});
