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
exports.ProductController = void 0;
class ProductController {
    constructor(productService) {
        this.productService = productService;
    }
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pagination, products } = yield this.productService.getAllProducts(req.query);
            res.status(200).json({
                status: "success",
                results: products.length,
                pagination,
                data: { products },
            });
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productService.getProductById(req.params.id);
            res.status(200).json({
                status: "success",
                data: { product },
            });
        });
    }
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productService.createProduct(req.body);
            res.status(201).json({
                status: "success",
                data: { product },
            });
        });
    }
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                status: "success",
                data: { product },
            });
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.productService.deleteProduct(req.params.id);
            res.status(204).json({
                status: "success",
                data: null,
            });
        });
    }
}
exports.ProductController = ProductController;
