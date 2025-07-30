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
const buffer_1 = require("buffer");
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
describe("Upload Middleware Tests", () => {
    let cookie;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const testUser = yield (0, uploads_helper_1.createTestUserAndGetCookie)("middleware");
        cookie = testUser.cookie;
    }));
    describe("File Filter Middleware", () => {
        it("should reject files with invalid extensions", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidBuffer = buffer_1.Buffer.from("fake file content");
            const res = yield (0, uploads_helper_1.uploadImageRequest)(invalidBuffer, "test.txt", "text/plain", cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
        }));
        it("should reject files with invalid MIME types", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidBuffer = buffer_1.Buffer.from("fake file content");
            const res = yield (0, uploads_helper_1.uploadImageRequest)(invalidBuffer, "test.png", "application/octet-stream", cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
        }));
        it("should reject files with mismatched extension and MIME type", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidBuffer = buffer_1.Buffer.from("fake file content");
            const res = yield (0, uploads_helper_1.uploadImageRequest)(invalidBuffer, "test.png", "text/plain", cookie);
            expect(res.status).toBe(400);
            expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
        }));
        it("should accept valid image extensions and MIME types", () => __awaiter(void 0, void 0, void 0, function* () {
            const validExtensions = [
                { ext: "jpg", mime: "image/jpeg" },
                { ext: "jpeg", mime: "image/jpeg" },
                { ext: "png", mime: "image/png" },
                { ext: "webp", mime: "image/webp" },
            ];
            for (const { ext, mime } of validExtensions) {
                const validBuffer = buffer_1.Buffer.from([
                    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                ]);
                const res = yield (0, uploads_helper_1.uploadImageRequest)(validBuffer, `test.${ext}`, mime, cookie);
                expect(res.status).toBe(201);
            }
        }));
    });
    describe("Memory Storage", () => {
        it("should handle file upload with memory storage", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(201);
            expect(res.body.data.image).toBeDefined();
        }));
    });
    describe("Field Name Validation", () => {
        it("should only accept 'image' field name", () => __awaiter(void 0, void 0, void 0, function* () {
            const imageBuffer = buffer_1.Buffer.from([
                0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ]);
            const res = yield (0, uploads_helper_1.uploadImageRequest)(imageBuffer, "test.png", "image/png", cookie);
            expect(res.status).toBe(201);
        }));
    });
});
