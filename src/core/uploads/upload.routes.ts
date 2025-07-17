import express from "express";
import { uploadController } from "..";
import authMiddleware from "../../middlewares/auth";
import { uploadMiddleware } from "../../middlewares/upload";

const router = express.Router();

router.post("/", [
	authMiddleware.protect,
	uploadMiddleware.single("image"),
	uploadController.uploadImage.bind(uploadController),
]);

export { router as uploadRouter };
