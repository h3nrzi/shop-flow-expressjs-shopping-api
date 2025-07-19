import { UploadService } from "./upload.service";
import { Request, Response } from "express";

export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	async uploadImage(
		req: Request,
		res: Response,
	): Promise<Response> {
		const file = req.file?.buffer.toString("base64");
		const mimetype = req.file?.mimetype;
		const fileUri = `data:${mimetype};base64,${file}`;

		const result = await this.uploadService.uploadImage(fileUri);

		return res.status(201).send({
			status: "success",
			data: { image: result.secure_url },
		});
	}
}
