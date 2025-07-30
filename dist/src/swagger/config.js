"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const basePath = path_1.default.resolve(__dirname, "./base.json");
const baseFile = fs_1.default.readFileSync(basePath, "utf8");
const swaggerDefinition = JSON.parse(baseFile);
const options = {
    definition: swaggerDefinition,
    apis: ["./src/swagger/apis/*.yaml"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
