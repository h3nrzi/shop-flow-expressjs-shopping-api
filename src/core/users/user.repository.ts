import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateCurrentUserInfoDto } from "./dtos/update-currentuser-info.dto";
import { IUpdateCurrentUserPasswordDto } from "./dtos/update-currentuser-password.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";
import { IUserDoc, IUserModel } from "./interfaces/user.interface";

export class UserRepository {
	constructor(private readonly userModel: IUserModel) {}

	/**
	 ************* @description READ OPERATIONS *************
	 */

	async findAll(): Promise<IUserDoc[]> {
		return this.userModel.find();
	}

	async findById(userId: string, select?: string): Promise<IUserDoc | null> {
		const user = await this.userModel.findById(userId).select(select ?? "");
		return user as IUserDoc;
	}

	async findByEmail(email: string): Promise<IUserDoc | null> {
		return this.userModel.findOne({ email });
	}

	/**
	 ************* @description AGGREGATE OPERATIONS *************
	 */

	async findCountByDay(
		endDate: Date,
		startDate?: Date
	): Promise<{ count: number; date: Date }[]> {
		const match = startDate
			? { createdAt: { $gte: startDate, $lte: endDate } }
			: {};

		const result = await this.userModel.aggregate([
			{
				$match: match, // filter the users by the startDate and endDate
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // group the users by the day
					count: { $sum: 1 }, // count the number of users by the day
				},
			},
			{
				$project: {
					_id: 0, // remove the _id field
					date: { $toDate: "$_id" }, // convert the _id to a date
					count: 1, // count the number of users by the day
				},
			},
			{
				$sort: {
					date: 1, // sort the users by the day
				},
			},
		]);

		return result;
	}

	/**
	 ************* @description CREATE OPERATIONS *************
	 */

	async create(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		return this.userModel.create(createUserDto);
	}

	/**
	 ************* @description UPDATE OPERATIONS *************
	 */

	async update(
		userId: string,
		payload:
			| IUpdateUserDto
			| IUpdateCurrentUserInfoDto
			| IUpdateCurrentUserPasswordDto
	): Promise<IUserDoc | null> {
		return this.userModel.findByIdAndUpdate(userId, payload, {
			new: true, // return the updated user
			runValidators: true, // validate the updateUserDto
		});
	}

	/**
	 ************* @description DELETE OPERATIONS *************
	 */

	async delete(userId: string): Promise<IUserDoc | null> {
		return this.userModel.findByIdAndDelete(userId);
	}
}
