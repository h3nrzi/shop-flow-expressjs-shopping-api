import { RequestHandler, Response } from "express";
import { Document, Model, Query } from "mongoose";
import Order from "../models/order";
import User from "../core/users/user.entity";
import { Populate } from "../types";
import APIFeatures from "../utils/apiFeatures";
import AppError from "../utils/appError";

abstract class CrudController {
	private readonly Model: Model<any>;
	private readonly populate?: Populate;

	protected constructor(Model: Model<any>, populate?: Populate) {
		this.Model = Model;
		this.populate = populate;
	}

	getAll: RequestHandler = async (req, res, next) => {
		const features = new APIFeatures(
			this.Model,
			req.query,
			req.body.initialFilter
		);
		const { pagination, skip, total } = await features
			.filter()
			.search()
			.sort()
			.limitFields()
			.pagination();

		if (req.query.page && skip >= total) {
			return next(new AppError("این صفحه وجود ندارد", 404));
		}

		const docs: Document[] = await features.dbQuery;

		return this.sendCrudResponse(res, docs, 200, pagination);
	};

	getOne: RequestHandler = async (req, res, next) => {
		const query: Query<any, any> = this.Model.findById(req.params.id);

		if (this.populate) query.populate({ ...this.populate });

		const doc: Document = await query;
		if (!doc) return next(new AppError("هیچ موردی با این شناسه یافت نشد", 404));

		return this.sendCrudResponse(res, doc, 200);
	};

	createOne: RequestHandler = async (req, res, next) => {
		const doc: Document = await this.Model.create(req.body);
		return this.sendCrudResponse(res, doc, 201);
	};

	updateOne: RequestHandler = async (req, res, next) => {
		let doc: Document | null = await this.Model.findById(req.params.id);
		if (!doc) return next(new AppError("هیچ موردی با این شناسه یافت نشد", 404));

		// if (doc instanceof Review) {
		// 	if (!(req.user.role === "admin") && !(doc.user.email === req.user.email))
		// 		return next(
		// 			new AppError("شما نمی توانید نظر دیگران را آپدیت کنید", 401),
		// 		);
		// }

		if (doc instanceof Order) {
			if (!(req.user.role === "admin") && !(doc.user.email === req.user.email))
				return next(
					new AppError("شما نمی توانید سفارش دیگران را آپدیت کنید", 401)
				);
		}

		const data = await this.Model.findOneAndUpdate(
			{ _id: req.params.id },
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);

		return this.sendCrudResponse(res, data, 200);
	};

	deleteOne: RequestHandler = async (req, res, next) => {
		const doc: Document | null = await this.Model.findById(req.params.id);
		if (!doc) {
			return next(new AppError("هیچ موردی با این شناسه یافت نشد", 404));
		}

		// if (doc instanceof Review) {
		// 	if (
		// 		!(req.user.role === "admin") &&
		// 		!(doc.user.email === req.user.email)
		// 	) {
		// 		return next(new AppError("شما نمی توانید نظر دیگران را حذف کنید", 401));
		// 	}
		// }

		if (doc instanceof Order) {
			if (
				!(req.user.role === "admin") &&
				!(doc.user.email === req.user.email)
			) {
				return next(
					new AppError("شما نمی توانید سفارش دیگران را حذف کنید", 401)
				);
			}
		}

		if (doc instanceof User) {
			if (doc.email === req.user.email) {
				return next(new AppError("شما نمی توانید حساب خود را حذف کنید", 401));
			}
		}

		await this.Model.findOneAndDelete({ _id: req.params.id });

		return this.sendCrudResponse(res, null, 204);
	};

	protected abstract sendCrudResponse(
		res: Response,
		data: any,
		statusCode: number,
		pagination?: any
	): void;
}

export default CrudController;
