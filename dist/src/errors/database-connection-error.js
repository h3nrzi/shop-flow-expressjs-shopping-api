"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectionError = void 0;
const custom_error_1 = require("./custom-error");
class DatabaseConnectionError extends custom_error_1.CustomError {
    constructor() {
        super("Error connecting to db!");
        this.statusCode = 500;
        this.serializeErrors = () => {
            return [
                {
                    field: null,
                    message: "Error connecting to db!",
                },
            ];
        };
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
