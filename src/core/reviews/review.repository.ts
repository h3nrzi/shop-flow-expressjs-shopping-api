import APIFeatures from "../../utils/apiFeatures";
import { ICreateReviewDto } from "./dtos/create-review.dto";
import { IUpdateReviewDto } from "./dtos/update-review.dto";
import Review from "./review.model";
import { IReviewDoc } from "./review.interface";

export class ReviewRepository {
	constructor(private readonly reviewModel: typeof Review) {}
	async getAll(
		query: any,
		initialFilter?: any
	): Promise<{
		pagination: any;
		skip: number;
		total: number;
		reviews: IReviewDoc[];
	}> {
		const features = new APIFeatures(
			this.reviewModel as any,
			query,
			initialFilter
		);
		const { pagination, skip, total } = await features
			.filter()
			.search()
			.sort()
			.limitFields()
			.pagination();

		const reviews = await features.dbQuery;

		return { pagination, skip, total, reviews };
	}

	create(createReviewDto: ICreateReviewDto): Promise<IReviewDoc> {
		return this.reviewModel.create(createReviewDto);
	}

	getById(id: string): Promise<IReviewDoc | null> {
		return this.reviewModel.findById(id);
	}

	update(
		id: string,
		updateReviewDto: IUpdateReviewDto
	): Promise<IReviewDoc | null> {
		return this.reviewModel.findByIdAndUpdate(id, updateReviewDto, {
			new: true,
		});
	}

	delete(id: string): Promise<IReviewDoc | null> {
		return this.reviewModel.findByIdAndDelete(id);
	}
}
