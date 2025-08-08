import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export class UploadService {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
	}

	async uploadImage(fileUri: string): Promise<UploadApiResponse> {
		return await cloudinary.uploader.upload(fileUri, {
			folder: "Azooghe",
		});
	}
}
