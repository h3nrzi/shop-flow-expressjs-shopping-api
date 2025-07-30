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
exports.UserRepository = void 0;
const apiFeatures_1 = __importDefault(require("../../utils/apiFeatures"));
class UserRepository {
    constructor(userModel) {
        this.userModel = userModel;
    }
    findAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const features = new apiFeatures_1.default(this.userModel, query);
            const { pagination, skip, total } = yield features
                .filter()
                .search()
                .sort()
                .limitFields()
                .pagination();
            const users = yield features.dbQuery;
            return { pagination, skip, total, users };
        });
    }
    findById(userId, select) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel
                .findById(userId)
                .select(select !== null && select !== void 0 ? select : "");
            return user;
        });
    }
    findByEmail(email, select) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userModel
                .findOne({ email })
                .select(select !== null && select !== void 0 ? select : "");
            return user;
        });
    }
    findByPasswordRestToken(passwordResetToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.findOne({
                passwordResetToken,
                passwordResetExpires: { $gt: Date.now() },
            });
        });
    }
    findCountByDay(endDate, startDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = startDate
                ? { createdAt: { $gte: startDate, $lte: endDate } }
                : {};
            const result = yield this.userModel.aggregate([
                {
                    $match: match,
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: { $toDate: "$_id" },
                        count: 1,
                    },
                },
                {
                    $sort: {
                        date: 1,
                    },
                },
            ]);
            return result;
        });
    }
    create(createUserDto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.create(createUserDto);
        });
    }
    update(userId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.findByIdAndUpdate(userId, payload, {
                new: true,
                runValidators: true,
            });
        });
    }
    delete(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.findByIdAndDelete(userId);
        });
    }
}
exports.UserRepository = UserRepository;
