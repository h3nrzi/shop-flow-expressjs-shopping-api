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
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
let mongo;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_SECRET = "asdf";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.NODE_ENV = "test";
    if (mongoose_1.default.connection.readyState !== 0) {
        yield mongoose_1.default.connection.close();
    }
    mongo = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    yield mongoose_1.default.connect(mongoUri);
    yield mongoose_1.default.connection.asPromise();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    const collections = yield mongoose_1.default.connection.db.collections();
    for (let collection of collections)
        yield collection.deleteMany({});
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    yield mongo.stop();
}));
jest.mock("@/utils/email", () => {
    return {
        sendEmail: jest.fn().mockResolvedValue(undefined),
    };
});
