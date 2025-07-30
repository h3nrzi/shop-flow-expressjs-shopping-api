"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const custom_error_1 = require("./custom-error");
class ForbiddenError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.statusCode = 403;
        this.serializeErrors = () => {
            return [
                {
                    field: null,
                    message: this.message,
                },
            ];
        };
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
