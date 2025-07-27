import request, { Response } from "supertest";
import app from "@/app";
import { Buffer } from "buffer";

// ===============================================
// ============ Helper Requests =================
// ===============================================

export const uploadImageRequest = async (
	file?: Buffer,
	filename?: string,
	mimetype?: string,
	cookie?: string
): Promise<Response> => {
	const req = request(app).post("/api/uploads");

	if (cookie) {
		req.set("Cookie", cookie);
	}

	if (file && filename && mimetype) {
		req.attach("image", file, {
			filename,
			contentType: mimetype,
		});
	}

	return req;
};

// ===============================================
// ============ Helper Functions =================
// ===============================================

export const createValidImageBuffer = (): Buffer => {
	// Create a minimal valid PNG buffer (1x1 pixel transparent PNG)
	const pngData = Buffer.from([
		0x89,
		0x50,
		0x4e,
		0x47,
		0x0d,
		0x0a,
		0x1a,
		0x0a, // PNG signature
		0x00,
		0x00,
		0x00,
		0x0d, // IHDR chunk length
		0x49,
		0x48,
		0x44,
		0x52, // IHDR
		0x00,
		0x00,
		0x00,
		0x01, // width: 1
		0x00,
		0x00,
		0x00,
		0x01, // height: 1
		0x08,
		0x06,
		0x00,
		0x00,
		0x00, // bit depth, color type, compression, filter, interlace
		0x1f,
		0x15,
		0xc4,
		0x89, // CRC
		0x00,
		0x00,
		0x00,
		0x0a, // IDAT chunk length
		0x49,
		0x44,
		0x41,
		0x54, // IDAT
		0x78,
		0x9c,
		0x63,
		0x00,
		0x01,
		0x00,
		0x00,
		0x05,
		0x00,
		0x01, // compressed data
		0x0d,
		0x0a,
		0x2d,
		0xb4, // CRC
		0x00,
		0x00,
		0x00,
		0x00, // IEND chunk length
		0x49,
		0x45,
		0x4e,
		0x44, // IEND
		0xae,
		0x42,
		0x60,
		0x82, // CRC
	]);
	return pngData;
};

export const createValidJpegBuffer = (): Buffer => {
	// Create a minimal valid JPEG buffer
	const jpegData = Buffer.from([
		0xff,
		0xd8,
		0xff,
		0xe0, // JPEG signature
		0x00,
		0x10,
		0x4a,
		0x46,
		0x49,
		0x46,
		0x00,
		0x01, // JFIF header
		0x01,
		0x01,
		0x00,
		0x48,
		0x00,
		0x48,
		0x00,
		0x00,
		0xff,
		0xdb,
		0x00,
		0x43,
		0x00, // Quantization table
		0x08,
		0x06,
		0x06,
		0x07,
		0x06,
		0x05,
		0x08,
		0x07,
		0x07,
		0x07,
		0x09,
		0x09,
		0x08,
		0x0a,
		0x0c,
		0x14,
		0x0d,
		0x0c,
		0x0b,
		0x0b,
		0x0c,
		0x19,
		0x12,
		0x13,
		0x0f,
		0x14,
		0x1d,
		0x1a,
		0x1f,
		0x1e,
		0x1d,
		0x1a,
		0x1c,
		0x1c,
		0x20,
		0x24,
		0x2e,
		0x27,
		0x20,
		0x22,
		0x2c,
		0x23,
		0x1c,
		0x1c,
		0x28,
		0x37,
		0x29,
		0x2c,
		0x30,
		0x31,
		0x34,
		0x34,
		0x34,
		0x1f,
		0x27,
		0x39,
		0x3d,
		0x38,
		0x32,
		0x3c,
		0x2e,
		0x33,
		0x34,
		0x32,
		0xff,
		0xc0,
		0x00,
		0x11,
		0x08,
		0x00,
		0x01,
		0x00, // Start of frame
		0x01,
		0x01,
		0x01,
		0x11,
		0x00,
		0x02,
		0x11,
		0x01,
		0x03,
		0x11,
		0x01,
		0xff,
		0xc4,
		0x00,
		0x14,
		0x00, // Huffman table
		0x01,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x08,
		0xff,
		0xc4,
		0x00,
		0x14,
		0x10,
		0x01,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0x00,
		0xff,
		0xda,
		0x00,
		0x0c,
		0x03,
		0x01,
		0x00,
		0x02,
		0x11, // Start of scan
		0x03,
		0x11,
		0x00,
		0x3f,
		0x00,
		0xb2,
		0xc0,
		0x07,
		0xff,
		0xd9, // End of image
	]);
	return jpegData;
};

export const createInvalidFileBuffer = (): Buffer => {
	// Create a text file buffer (invalid for image upload)
	return Buffer.from("This is not an image file", "utf-8");
};

export const getValidImageFiles = () => [
	{
		buffer: createValidImageBuffer(),
		filename: "test.png",
		mimetype: "image/png",
		description: "PNG image",
	},
	{
		buffer: createValidJpegBuffer(),
		filename: "test.jpg",
		mimetype: "image/jpeg",
		description: "JPEG image",
	},
	{
		buffer: createValidJpegBuffer(),
		filename: "test.jpeg",
		mimetype: "image/jpeg",
		description: "JPEG image with .jpeg extension",
	},
];

export const getInvalidImageFiles = () => [
	{
		buffer: createInvalidFileBuffer(),
		filename: "test.txt",
		mimetype: "text/plain",
		description: "text file",
		expectedError: "تصویر فقط پشتیبانی میشود!",
	},
	{
		buffer: createInvalidFileBuffer(),
		filename: "test.pdf",
		mimetype: "application/pdf",
		description: "PDF file",
		expectedError: "تصویر فقط پشتیبانی میشود!",
	},
	{
		buffer: createInvalidFileBuffer(),
		filename: "test.gif",
		mimetype: "image/gif",
		description: "GIF image (unsupported)",
		expectedError: "تصویر فقط پشتیبانی میشود!",
	},
];

export const createTestUserAndGetCookie = async (
	suffix: string = "uploader"
) => {
	const user = {
		name: "test",
		email: `test${suffix}@test.com`,
		password: "test123456",
		passwordConfirmation: "test123456",
	};

	const res = await request(app)
		.post("/api/users/signup")
		.send(user);
	return {
		user,
		cookie: res.headers["set-cookie"][0],
	};
};
