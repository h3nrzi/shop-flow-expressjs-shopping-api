import { ReviewRepository } from "./review.repository";
import { IReviewDoc } from "./review.interface";
import { NotFoundError } from "../../errors/not-found-error";
import { ForbiddenError } from "../../errors/forbidden-error";
import { ICreateReviewDto } from "./dtos/create-review.dto";
import { IUpdateReviewDto } from "./dtos/update-review.dto";
import ProductRepository from "../products/product.repository";

export class ReviewService {
	constructor(
		private readonly reviewRepository: ReviewRepository,
		private readonly productRepository: ProductRepository
	) {}

	async getAllReviews(
		query: any,
		initialFilter?: any
	): Promise<{
		pagination: any;
		reviews: IReviewDoc[];
	}> {
		const { pagination, skip, total, reviews } =
			await this.reviewRepository.getAll(query, initialFilter);

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
		const product = await this.productRepository.getOne(
			createReviewDto.product
		);
		if (!product) {
			throw new NotFoundError("آیدی محصول ارائه برای درج نظر وجود ندارد.");
		}

		return this.reviewRepository.create(createReviewDto);
	}

	async updateReview(
		id: string,
		updateReviewDto: IUpdateReviewDto
	): Promise<IReviewDoc | null> {
		// check if review exists, if not throw error
		await this.getReviewById(id);

		// update review
		return this.reviewRepository.update(id, updateReviewDto);
	}

	async deleteReview(
		id: string,
		productId: string,
		userId: string
	): Promise<IReviewDoc | null> {
		// Check if product exists
		const product = await this.productRepository.getOne(productId);
		if (!product) {
			throw new NotFoundError("محصولی با این شناسه یافت نشد");
		}

		// Check if review exists and get it atomically
		const review = await this.reviewRepository.getById(id);
		if (!review) {
			throw new NotFoundError("نظری با این شناسه یافت نشد");
		}

		// Check if review belongs to the specified product
		const reviewProductId = (review.product as any)._id
			? (review.product as any)._id.toString()
			: review.product.toString();
		if (reviewProductId !== productId) {
			throw new NotFoundError("نظری با این شناسه یافت نشد");
		}

		// Check if user owns the review
		const reviewUserId = (review.user as any)._id
			? (review.user as any)._id.toString()
			: review.user.toString();

		// Convert userId to string for comparison
		const currentUserId = userId.toString();

		if (reviewUserId !== currentUserId) {
			throw new ForbiddenError("شما مجاز به حذف این نظر نیستید");
		}

		// Delete review atomically - this will return null if already deleted
		const deletedReview = await this.reviewRepository.delete(id);
		if (!deletedReview) {
			throw new NotFoundError("نظری با این شناسه یافت نشد");
		}

		return deletedReview;
	}
}
