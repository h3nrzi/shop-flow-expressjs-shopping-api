import { UploadService } from "./upload.service";

export class UploadController {
	constructor(private readonly uploadService: UploadService) {}

	async uploadImage(req: Request, res: Response) {}
}
