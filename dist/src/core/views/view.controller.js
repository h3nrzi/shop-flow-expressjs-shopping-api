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
exports.ViewController = void 0;
class ViewController {
    constructor(viewService) {
        this.viewService = viewService;
    }
    getHomePage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const products = yield this.viewService.getProducts();
            res.status(200).render("homePage", {
                title: "Shop Flow - Home Page",
                products,
            });
        });
    }
    getLoginPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).render("loginPage", {
                title: "Shop Flow - Login",
            });
        });
    }
    getEditProductPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this.viewService.getProductById(req.params.id);
            res.status(200).render("editProductPage", {
                title: "Shop Flow - Edit Product",
                product,
            });
        });
    }
    getCreateProductPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).render("createProductPage", {
                title: "Shop Flow - Create Product",
            });
        });
    }
}
exports.ViewController = ViewController;
