import { Request } from "express";
import multer, { StorageEngine } from "multer";
import path from "path";
import { BadRequestError } from "../errors/bad-request-error";

const storage: StorageEngine = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
	const fileTypes = /jpg|jpeg|png|webp/;
	const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = fileTypes.test(file.mimetype);

	if (!extname || !mimetype) callback(new BadRequestError("تصویر فقط پشتیبانی میشود!"));
	callback(null, true);
};

export const upload = multer({ storage, fileFilter });

const uploadMiddleware = { upload };
export default uploadMiddleware;
