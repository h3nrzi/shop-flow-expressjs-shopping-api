import express from "express";
import authMiddleware from "../../middlewares/auth";
import reviewMiddleware from "../../middlewares/review";
import { reviewController } from "..";

const router = express.Router({ mergeParams: true });

/************************************************************************
 *********  @description Protect all routes below to users only *********
 ************************************************************************/
router.use(authMiddleware.protect);

router.get("/", [
	reviewMiddleware.beforeGetAll,
	reviewController.getAllReviews.bind(reviewController),
]);

router.get("/:id", reviewController.getReviewById.bind(reviewController));

router.post("/", [
	// TODO: validateRequest
	reviewMiddleware.beforeCreate,
	reviewController.createReview.bind(reviewController),
]);

router.patch("/:id", [
	// TODO: validateRequest
	reviewMiddleware.beforeUpdate,
	reviewController.updateReview.bind(reviewController),
]);

router.delete("/:id", reviewController.deleteReview.bind(reviewController));

export { router as reviewRouter };
