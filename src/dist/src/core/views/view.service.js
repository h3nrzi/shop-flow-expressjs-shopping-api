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
exports.ViewService = void 0;
const not_found_error_1 = require("../../errors/not-found-error");
class ViewService {
    constructor(productModel) {
        this.productModel = productModel;
    }
    getProducts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productModel.find();
        });
    }
    getProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.productModel.findById(id);
            if (!product) {
                throw new not_found_error_1.NotFoundError("Product not found");
            }
            return product;
        });
    }
}
exports.ViewService = ViewService;
