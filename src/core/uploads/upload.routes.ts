import express from "express";
import { uploadController } from "..";
import { uploadMiddleware } from "../../middlewares/upload";
import authMiddleware from "../../middlewares/auth";
import { body } from "express-validator";
import { validateRequest } from "../../middlewares/validate-request";

const router = express.Router();

router.post("/", [
	authMiddleware.protect,
	body("image").notEmpty().withMessage("تصویر الزامی است"),
	validateRequest,
	uploadMiddleware.single("image"),
	uploadController.uploadImage.bind(uploadController),
]);

export { router as uploadRouter };
