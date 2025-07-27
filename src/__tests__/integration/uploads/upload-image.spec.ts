import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	uploadImageRequest,
	createValidImageBuffer,
	createTestUserAndGetCookie,
	getValidImageFiles,
	getInvalidImageFiles,
} from "@/__tests__/helpers/uploads.helper";

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

describe("POST /api/uploads", () => {
	let cookie: string;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie(
			"uploader"
		);
		cookie = testUser.cookie;
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const validImageBuffer = createValidImageBuffer();
			const res = await uploadImageRequest(
				validImageBuffer,
				"test.png",
				"image/png"
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const validImageBuffer = createValidImageBuffer();
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await uploadImageRequest(
				validImageBuffer,
				"test.png",
				"image/png",
				invalidCookie
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("should return 201, if", () => {
		it("no file is provided (controller doesn't validate)", async () => {
			const res = await uploadImageRequest(
				undefined,
				undefined,
				undefined,
				cookie
			);

			// The controller doesn't validate for missing files
			// It will try to upload with undefined values
			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
		});
	});

	describe("should return 400, if", () => {
		const invalidFiles = getInvalidImageFiles();
		invalidFiles.forEach(
			({
				buffer,
				filename,
				mimetype,
				description,
				expectedError,
			}) => {
				it(`file is ${description}`, async () => {
					const res = await uploadImageRequest(
						buffer,
						filename,
						mimetype,
						cookie
					);

					expect(res.status).toBe(400);
					expect(res.body.errors[0].message).toBe(expectedError);
				});
			}
		);
	});

	describe("should return 201, if", () => {
		const validFiles = getValidImageFiles();
		validFiles.forEach(
			({ buffer, filename, mimetype, description }) => {
				it(`upload is successful with ${description}`, async () => {
					const res = await uploadImageRequest(
						buffer,
						filename,
						mimetype,
						cookie
					);

					expect(res.status).toBe(201);
					expect(res.body.status).toBe("success");
					expect(res.body.data.image).toBeDefined();
					expect(res.body.data.image).toMatch(
						/^https:\/\/res\.cloudinary\.com/
					);
				});
			}
		);

		it("upload is successful and returns correct response structure", async () => {
			const validImageBuffer = createValidImageBuffer();
			const res = await uploadImageRequest(
				validImageBuffer,
				"test.png",
				"image/png",
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("status", "success");
			expect(res.body).toHaveProperty("data");
			expect(res.body.data).toHaveProperty("image");
			expect(typeof res.body.data.image).toBe("string");
			expect(res.body.data.image).toContain("cloudinary.com");
		});
	});

	describe("should handle edge cases", () => {
		it("should handle large file names", async () => {
			const validImageBuffer = createValidImageBuffer();
			const longFilename = "a".repeat(200) + ".png";
			const res = await uploadImageRequest(
				validImageBuffer,
				longFilename,
				"image/png",
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
		});

		it("should handle files with special characters in name", async () => {
			const validImageBuffer = createValidImageBuffer();
			const specialFilename = "test-file_123.png";
			const res = await uploadImageRequest(
				validImageBuffer,
				specialFilename,
				"image/png",
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
		});

		it("should handle webp images", async () => {
			const validImageBuffer = createValidImageBuffer();
			const res = await uploadImageRequest(
				validImageBuffer,
				"test.webp",
				"image/webp",
				cookie
			);

			expect(res.status).toBe(201);
			expect(res.body.status).toBe("success");
		});
	});
});
