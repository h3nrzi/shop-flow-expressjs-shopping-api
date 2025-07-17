import { ReviewService } from "./review.service";
import { Request, Response } from "express";

export class ReviewController {
	constructor(private readonly reviewService: ReviewService) {}

	async getAllReviews(req: Request, res: Response): Promise<void> {
		const { pagination, reviews } = await this.reviewService.getAllReviews(req.query);

		res.status(200).json({
			status: "success",
			results: reviews.length,
			pagination,
			data: { reviews },
		});
	}

	async getReviewById(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const review = await this.reviewService.getReviewById(id);

		res.status(200).json({
			status: "success",
			data: { review },
		});
	}

	async createReview(req: Request, res: Response): Promise<void> {
		const review = await this.reviewService.createReview(req.body);

		res.status(201).json({
			status: "success",
			data: { review },
		});
	}

	async updateReview(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		const review = await this.reviewService.updateReview(id, req.body);

		res.status(200).json({
			status: "success",
			data: { review },
		});
	}

	async deleteReview(req: Request, res: Response): Promise<void> {
		const { id } = req.params;
		await this.reviewService.deleteReview(id);

		res.status(204).json({
			status: "success",
			data: null,
		});
	}
}
