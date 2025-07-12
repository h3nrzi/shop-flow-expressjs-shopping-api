import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";
import { IUserDoc, IUserModel } from "./interfaces/user.interface";

export class UserRepository {
	constructor(private readonly userModel: IUserModel) {}

	async findAll(): Promise<IUserDoc[]> {
		return this.userModel.find();
	}

	async findById(userId: string): Promise<IUserDoc | null> {
		return this.userModel.findById(userId);
	}

	async findByEmail(email: string): Promise<IUserDoc | null> {
		return this.userModel.findOne({ email });
	}

	async findCountByDay(
		endDate: Date,
		startDate?: Date
	): Promise<{ count: number; date: Date }[]> {
		const match = startDate
			? { createdAt: { $gte: startDate, $lte: endDate } }
			: {};

		const result = await this.userModel.aggregate([
			{
				$match: match,
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
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
	}

	async create(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		return this.userModel.create(createUserDto);
	}

	async update(
		userId: string,
		updateUserDto: IUpdateUserDto
	): Promise<IUserDoc | null> {
		return this.userModel.findByIdAndUpdate(userId, updateUserDto, {
			new: true,
		});
	}

	async delete(userId: string): Promise<IUserDoc | null> {
		return this.userModel.findByIdAndDelete(userId);
	}
}
