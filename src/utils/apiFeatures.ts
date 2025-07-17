import { Query, Model } from "mongoose";

export default class APIFeatures {
	private readonly Model: Model<any>;
	private readonly queryRequest: any;
	public dbQuery: Query<any, any>;

	constructor(Model: Model<any>, reqQuery: any, initialFilter?: any) {
		this.Model = Model;
		this.queryRequest = reqQuery;
		this.dbQuery = this.Model.find(initialFilter);
	}

	filter(): this {
		const queryObject = { ...this.queryRequest };
		const excludedFields = ["sort", "fields", "search", "page", "limit"];
		excludedFields.forEach(field => delete queryObject[field]);

		const queryString = JSON.stringify(queryObject).replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

		this.dbQuery = this.dbQuery.find(JSON.parse(queryString));

		return this;
	}

	search(): this {
		if (this.queryRequest.search) {
			const searchCriteria = {
				name: { $regex: this.queryRequest.search, $options: "i" },
			};
			this.dbQuery = this.dbQuery.find(searchCriteria);
		}

		return this;
	}

	sort(): this {
		if (this.queryRequest.sort) {
			const sortBy = this.queryRequest.sort.split(",").join(" ");
			this.dbQuery = this.dbQuery.sort(sortBy);
		} else {
			this.dbQuery = this.dbQuery.sort("-createdAt");
		}

		return this;
	}

	limitFields(): this {
		if (this.queryRequest.fields) {
			const fields = this.queryRequest.fields.split(",").join(" ");
			this.dbQuery = this.dbQuery.select(fields);
		} else {
			this.dbQuery = this.dbQuery.select("-__v");
		}

		return this;
	}

	public async pagination() {
		const total = await this.Model.find(this.dbQuery.getFilter()).countDocuments();
		const limit = parseInt(this.queryRequest.limit) || 8;
		const pages = Math.ceil(total / limit);
		const page = parseInt(this.queryRequest.page) || 1;
		const skip = (page - 1) * limit;

		if (this.queryRequest.page) this.dbQuery = this.dbQuery.skip(skip).limit(limit);
		const pagination = this.queryRequest.page ? { total, limit, pages, page, skip } : null;

		return { pagination, total, skip };
	}
}
