import { ReviewRepository } from "./review.repository";
import { IReviewDoc } from "./review.interface";
import { NotFoundError } from "../../errors/not-found-error";
import { ICreateReviewDto } from "./dtos/create-review.dto";
import { IUpdateReviewDto } from "./dtos/update-review.dto";

export class ReviewService {
	constructor(private readonly reviewRepository: ReviewRepository) {}

	async getAllReviews(
		query: any,
		initialFilter?: any,
	): Promise<{
		pagination: any;
		reviews: IReviewDoc[];
	}> {
		const { pagination, skip, total, reviews } = await this.reviewRepository.getAll(
			query,
			initialFilter,
		);

		if (query.page && skip >= total) {
			throw new NotFoundError("این صفحه وجود ندارد");
		}

		return { pagination, reviews };
	}

	async getReviewById(id: string): Promise<IReviewDoc | null> {
		// check if review exists, if not throw error
		const review = await this.reviewRepository.getById(id);
		if (!review) {
			throw new NotFoundError("نظری با این شناسه یافت نشد");
		}

		// return review
		return review;
	}

	async createReview(createReviewDto: ICreateReviewDto): Promise<IReviewDoc> {
		return this.reviewRepository.create(createReviewDto);
	}

	async updateReview(id: string, updateReviewDto: IUpdateReviewDto): Promise<IReviewDoc | null> {
		// check if review exists, if not throw error
		await this.getReviewById(id);

		// update review
		return this.reviewRepository.update(id, updateReviewDto);
	}

	async deleteReview(id: string): Promise<IReviewDoc | null> {
		// check if review exists, if not throw error
		await this.getReviewById(id);

		// delete review
		return this.reviewRepository.delete(id);
	}
}
