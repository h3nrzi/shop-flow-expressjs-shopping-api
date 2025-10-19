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
exports.ReviewService = void 0;
const not_found_error_1 = require("../../errors/not-found-error");
const forbidden_error_1 = require("../../errors/forbidden-error");
class ReviewService {
    constructor(reviewRepository, productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }
    getAllReviews(query, initialFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, skip, total, reviews } = yield this.reviewRepository.getAll(query, initialFilter);
            if (query.page && skip >= total) {
                throw new not_found_error_1.NotFoundError("این صفحه وجود ندارد");
            }
            return { pagination, reviews };
        });
    }
    getReviewById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const review = yield this.reviewRepository.getById(id);
            if (!review) {
                throw new not_found_error_1.NotFoundError("نظری با این شناسه یافت نشد");
            }
            return review;
        });
    }
    createReview(createReviewDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.getOne(createReviewDto.product);
            if (!product) {
                throw new not_found_error_1.NotFoundError("آیدی محصول ارائه برای درج نظر وجود ندارد.");
            }
            return this.reviewRepository.create(createReviewDto);
        });
    }
    updateReview(id, updateReviewDto) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getReviewById(id);
            return this.reviewRepository.update(id, updateReviewDto);
        });
    }
    deleteReview(id, productId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.getOne(productId);
            if (!product) {
                throw new not_found_error_1.NotFoundError("محصولی با این شناسه یافت نشد");
            }
            const review = yield this.reviewRepository.getById(id);
            if (!review) {
                throw new not_found_error_1.NotFoundError("نظری با این شناسه یافت نشد");
            }
            const reviewProductId = review.product._id
                ? review.product._id.toString()
                : review.product.toString();
            if (reviewProductId !== productId) {
                throw new not_found_error_1.NotFoundError("نظری با این شناسه یافت نشد");
            }
            const reviewUserId = review.user._id
                ? review.user._id.toString()
                : review.user.toString();
            const currentUserId = userId.toString();
            if (reviewUserId !== currentUserId) {
                throw new forbidden_error_1.ForbiddenError("شما مجاز به حذف این نظر نیستید");
            }
            const deletedReview = yield this.reviewRepository.delete(id);
            if (!deletedReview) {
                throw new not_found_error_1.NotFoundError("نظری با این شناسه یافت نشد");
            }
            return deletedReview;
        });
    }
}
exports.ReviewService = ReviewService;
