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
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const core_1 = require("../core");
const isLoggedIn = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = req.headers;
    let token = undefined;
    if (authorization && authorization.startsWith("Bearer"))
        token = authorization.split(" ")[1];
    else if (req.cookies.jwt)
        token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = (yield (0, verifyToken_1.default)(token));
            const currentUser = yield core_1.userRepository.findById(decoded.id);
            if (!currentUser) {
                return res.redirect("/admin/login");
            }
            if (currentUser.changePasswordAfter(decoded.iat)) {
                return res.redirect("/admin/login");
            }
            res.locals.user = currentUser;
            return next();
        }
        catch (err) {
            return res.redirect("/admin/login");
        }
    }
    return res.redirect("/admin/login");
});
const viewMiddleware = { isLoggedIn };
exports.default = viewMiddleware;
