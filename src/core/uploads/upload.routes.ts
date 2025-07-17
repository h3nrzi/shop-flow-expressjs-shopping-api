import express from "express";
import { uploadController } from "..";
import uploadMiddleware from "../../middlewares/upload";

const uploadRouter = express.Router();

uploadRouter.post(
	//
	"/",
	uploadMiddleware.upload.single("image"),
	uploadController.uploadImage.bind(uploadController)
);

export default uploadRouter;
