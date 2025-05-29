import APIFeatures from "../../utils/apiFeatures";
import { ICreateReviewDto } from "./dtos/create-review.dto";
import { IUpdateReviewDto } from "./dtos/update-review.dto";
import Review from "./entities/review.model";
import { IReviewDoc } from "./interfaces/review.interface";

export class ReviewRepository {
	async getAll(
		query: any,
		initialFilter?: any
	): Promise<{
		pagination: any;
		skip: number;
		total: number;
		reviews: IReviewDoc[];
	}> {
		const features = new APIFeatures(Review as any, query, initialFilter);
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
		return Review.create(createReviewDto);
	}

	getById(id: string): Promise<IReviewDoc | null> {
		return Review.findById(id);
	}

	update(
		id: string,
		updateReviewDto: IUpdateReviewDto
	): Promise<IReviewDoc | null> {
		return Review.findByIdAndUpdate(id, updateReviewDto, { new: true });
	}

	delete(id: string): Promise<IReviewDoc | null> {
		return Review.findByIdAndDelete(id);
	}
}
