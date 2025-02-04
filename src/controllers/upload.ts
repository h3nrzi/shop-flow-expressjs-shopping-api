import { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";

const upload: RequestHandler = async (req, res, next) => {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});

	const fileUri = `data:${req.file?.mimetype};base64,${req.file?.buffer.toString("base64")}`;

	const result = await cloudinary.uploader.upload(fileUri, {
		folder: "Azooghe",
	});

	return res.status(201).send({
		status: "success",
		data: { image: result.secure_url },
	});
};

const uploadController = { upload };
export default uploadController;
