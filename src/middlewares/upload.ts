import multer, { StorageEngine } from "multer";
import { Request } from "express";
import path from "path";
import AppError from "../utils/appError";

const storage: StorageEngine = multer.memoryStorage();

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback: multer.FileFilterCallback,
) => {
	const fileTypes = /jpg|jpeg|png|webp/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = fileTypes.test(file.mimetype);

	if (!extname || !mimetype)
		return callback(new AppError("تصویر فقط پشتیبانی میشود!", 400));

	callback(null, true);
};

export const upload = multer({ storage, fileFilter });

const uploadMiddleware = { upload };
export default uploadMiddleware;
