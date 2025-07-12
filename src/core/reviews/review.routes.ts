import express from "express";
import authMiddleware from "../../middlewares/auth";
import reviewMiddleware from "../../middlewares/review";
import { ReviewRepository } from "./review.repository";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";

const router = express.Router({ mergeParams: true });
const reviewRepository = new ReviewRepository();
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

router.get("/", [
	reviewMiddleware.beforeGetAll,
	reviewController.getAllReviews.bind(reviewController),
]);

router.get("/:id", reviewController.getReviewById.bind(reviewController));

router.post("/", [
	authMiddleware.protect,
	// TODO: validateRequest
	reviewMiddleware.beforeCreate,
	reviewController.createReview.bind(reviewController),
]);

router.patch("/:id", [
	authMiddleware.protect,
	// TODO: validateRequest
	reviewMiddleware.beforeUpdate,
	reviewController.updateReview.bind(reviewController),
]);

router.delete(
	"/:id",
	authMiddleware.protect,
	reviewController.deleteReview.bind(reviewController)
);

export { router as reviewRouter };
