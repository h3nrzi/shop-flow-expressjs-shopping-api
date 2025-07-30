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
exports.ProductService = void 0;
const not_found_error_1 = require("../../errors/not-found-error");
class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    getAllProducts(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, skip, total, products } = yield this.productRepository.getAll(query);
            if (query.page && skip >= total) {
                throw new not_found_error_1.NotFoundError("این صفحه وجود ندارد");
            }
            return { pagination, products };
        });
    }
    getProductById(id, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.getOne(id, populate);
            if (!product) {
                throw new not_found_error_1.NotFoundError("هیچ محصولی با این شناسه یافت نشد");
            }
            return product;
        });
    }
    createProduct(createProductDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.productRepository.createOne(createProductDto);
        });
    }
    updateProduct(id, updateProductDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.updateOne(id, updateProductDto);
            if (!product) {
                throw new not_found_error_1.NotFoundError("هیچ محصولی با این شناسه یافت نشد");
            }
            return product;
        });
    }
    deleteProduct(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productRepository.deleteOne(id);
            if (!product) {
                throw new not_found_error_1.NotFoundError("هیچ محصولی با این شناسه یافت نشد");
            }
            return product;
        });
    }
}
exports.ProductService = ProductService;
