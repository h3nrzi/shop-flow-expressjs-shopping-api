"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableEntityError = void 0;
const custom_error_1 = require("./custom-error");
class UnprocessableEntityError extends custom_error_1.CustomError {
    constructor(message) {
        super(message);
        this.message = message;
        this.statusCode = 422;
        this.serializeErrors = () => [
            {
                field: null,
                message: this.message,
            },
        ];
        Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
