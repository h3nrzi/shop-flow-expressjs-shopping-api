import express from "express";
import uploadController from "../_controllers/upload";
import uploadMiddleware from "../middlewares/upload";

const uploadRouter = express.Router();

uploadRouter.post(
	"/",
	uploadMiddleware.upload.single("image"),
	uploadController.upload
);

export default uploadRouter;
