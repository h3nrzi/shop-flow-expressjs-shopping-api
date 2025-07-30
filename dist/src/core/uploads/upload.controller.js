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
exports.UploadController = void 0;
class UploadController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    uploadImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const file = (_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer.toString("base64");
            const mimetype = (_b = req.file) === null || _b === void 0 ? void 0 : _b.mimetype;
            const fileUri = `data:${mimetype};base64,${file}`;
            const result = yield this.uploadService.uploadImage(fileUri);
            return res.status(201).send({
                status: "success",
                data: { image: result.secure_url },
            });
        });
    }
}
exports.UploadController = UploadController;
