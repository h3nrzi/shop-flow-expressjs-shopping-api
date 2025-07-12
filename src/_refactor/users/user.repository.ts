import { IUserDoc, IUserModel } from "./interfaces/user.interface";
import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";

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
