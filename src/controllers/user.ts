import { RequestHandler, Response } from "express";
import User from "../core/users/entities/user.entity";
import {
	UpdateMePasswordRequestHandler,
	UpdateMeRequestHandler,
} from "../dtos";
import AppError from "../utils/appError";
import _ from "lodash";
import createSendTokenAndResponse from "../utils/createSendTokenAndResponse";
import { Populate } from "../types";
import CrudController from "./crud";

class UserController extends CrudController {
	constructor(populate?: Populate) {
		super(User, populate);
	}

	protected override sendCrudResponse(
		res: Response,
		data: any,
		statusCode: number,
		pagination?: any
	) {
		res.status(statusCode).json({
			status: "success",
			results: Array.isArray(data) ? data.length : undefined,
			pagination,
			data: Array.isArray(data) ? { users: data } : { user: data },
		});
	}

	updateMe: UpdateMeRequestHandler = async (req, res, next) => {
		const { name, email, password, passwordConfirmation, photo } = req.body;

		if (password || passwordConfirmation)
			return next(
				new AppError("با این درخواست نمی توانید رمز عبور را آپدیت کنید", 400)
			);

		const updatedUser = await User.findByIdAndUpdate(
			req.user._id,
			{ name, email, photo },
			{
				new: true,
				runValidators: true,
			}
		);

		return res.status(200).json({
			status: "success",
			data: {
				user: _.pick(updatedUser, ["id", "name", "email", "role", "photo"]),
			},
		});
	};

	updateMePassword: UpdateMePasswordRequestHandler = async (req, res, next) => {
		const { passwordCurrent, password, passwordConfirmation } = req.body;

		const user = await User.findById(req.user._id).select("+password");

		const correct = await user!.correctPassword(passwordCurrent);
		if (!correct)
			return next(new AppError("رمز عبور فعلی شما اشتباه است", 401));

		user!.password = password;
		user!.passwordConfirmation = passwordConfirmation;
		await user!.save();

		return createSendTokenAndResponse(user!, 200, res);
	};

	deleteMe: RequestHandler = async (req, res, next) => {
		await User.findByIdAndUpdate(req.user._id, { active: false });

		return res.status(204).json({
			status: "success",
			data: null,
		});
	};
}

const userController = new UserController();
export default userController;
