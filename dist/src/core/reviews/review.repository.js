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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const apiFeatures_1 = __importDefault(require("../../utils/apiFeatures"));
class ReviewRepository {
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    getAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const features = new apiFeatures_1.default(this.reviewModel, query);
            const { pagination, skip, total } = yield features
                .filter()
                .search()
                .sort()
                .limitFields()
                .pagination();
            const reviews = yield features.dbQuery;
            return { pagination, skip, total, reviews };
        });
    }
    create(createReviewDto) {
        return this.reviewModel.create(createReviewDto);
    }
    getById(id) {
        return this.reviewModel.findById(id);
    }
    update(id, updateReviewDto) {
        return this.reviewModel.findByIdAndUpdate(id, updateReviewDto, {
            new: true,
        });
    }
    delete(id) {
        return this.reviewModel.findByIdAndDelete(id);
    }
}
exports.ReviewRepository = ReviewRepository;
