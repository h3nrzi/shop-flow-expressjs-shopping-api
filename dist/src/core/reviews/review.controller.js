"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    getAllReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, reviews } = yield this.reviewService.getAllReviews(req.query, req.body.initialFilter);
            res.status(200).json({
                status: "success",
                results: reviews.length,
                pagination,
                data: { reviews },
            });
        });
    }
    getReviewById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const review = yield this.reviewService.getReviewById(id);
            res.status(200).json({
                status: "success",
                data: { review },
            });
        });
    }
    createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield this.reviewService.createReview(req.body);
            res.status(201).json({
                status: "success",
                data: { review },
            });
        });
    }
    updateReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const review = yield this.reviewService.updateReview(id, req.body);
            res.status(200).json({
                status: "success",
                data: { review },
            });
        });
    }
    deleteReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { productId } = req.body;
            const userId = req.user._id;
            yield this.reviewService.deleteReview(id, productId, userId);
            res.status(204).send();
        });
    }
}
exports.ReviewController = ReviewController;
