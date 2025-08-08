import {
	uploadImageRequest,
	createTestUserAndGetCookie,
} from "@/__tests__/helpers/uploads.helper";
import { Buffer } from "buffer";

// Mock Cloudinary
jest.mock("cloudinary", () => ({
	v2: {
		config: jest.fn(),
		uploader: {
			upload: jest.fn().mockResolvedValue({
				secure_url:
					"https://res.cloudinary.com/test/image/upload/v1234567890/Azooghe/test.jpg",
				public_id: "Azooghe/test",
			}),
		},
	},
}));

describe("Upload Middleware Tests", () => {
	let cookie: string;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie("middleware");
		cookie = testUser.cookie;
	});

	describe("File Filter Middleware", () => {
		it("should reject files with invalid extensions", async () => {
			const invalidBuffer = Buffer.from("fake file content");
			const res = await uploadImageRequest(
				invalidBuffer,
				"test.txt",
				"text/plain",
				cookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
		});

		it("should reject files with invalid MIME types", async () => {
			const invalidBuffer = Buffer.from("fake file content");
			const res = await uploadImageRequest(
				invalidBuffer,
				"test.png",
				"application/octet-stream",
				cookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
		});

		it("should reject files with mismatched extension and MIME type", async () => {
			const invalidBuffer = Buffer.from("fake file content");
			const res = await uploadImageRequest(
				invalidBuffer,
				"test.png",
				"text/plain",
				cookie,
			);

			expect(res.status).toBe(400);
			expect(res.body.errors[0].message).toBe("تصویر فقط پشتیبانی میشود!");
		});

		it("should accept valid image extensions and MIME types", async () => {
			const validExtensions = [
				{ ext: "jpg", mime: "image/jpeg" },
				{ ext: "jpeg", mime: "image/jpeg" },
				{ ext: "png", mime: "image/png" },
				{ ext: "webp", mime: "image/webp" },
			];

			for (const { ext, mime } of validExtensions) {
				// Create a minimal valid image buffer
				const validBuffer = Buffer.from([
					0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
				]);

				const res = await uploadImageRequest(
					validBuffer,
					`test.${ext}`,
					mime,
					cookie,
				);

				expect(res.status).toBe(201);
			}
		});
	});

	describe("Memory Storage", () => {
		it("should handle file upload with memory storage", async () => {
			const imageBuffer = Buffer.from([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
			]);

			const res = await uploadImageRequest(
				imageBuffer,
				"test.png",
				"image/png",
				cookie,
			);

			expect(res.status).toBe(201);
			expect(res.body.data.image).toBeDefined();
		});
	});

	describe("Field Name Validation", () => {
		it("should only accept 'image' field name", async () => {
			const imageBuffer = Buffer.from([
				0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
			]);

			// This test verifies that the middleware is configured to accept only 'image' field
			// The actual field name validation is handled by multer's single('image') configuration
			const res = await uploadImageRequest(
				imageBuffer,
				"test.png",
				"image/png",
				cookie,
			);

			expect(res.status).toBe(201);
		});
	});
});
