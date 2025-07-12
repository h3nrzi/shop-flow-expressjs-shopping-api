import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";
import { IUserDoc } from "./interfaces/user.interface";
import { UserRepository } from "./user.repository";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findAllUsers(): Promise<IUserDoc[]> {
		return this.userRepository.findAll();
	}

	async findUserById(userId: string): Promise<IUserDoc | null> {
		return this.userRepository.findById(userId);
	}

	async createUser(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		return this.userRepository.create(createUserDto);
	}

	async updateUser(
		userId: string,
		updateUserDto: IUpdateUserDto
	): Promise<IUserDoc | null> {
		return this.userRepository.update(userId, updateUserDto);
	}

	async deleteUser(userId: string): Promise<IUserDoc | null> {
		return this.userRepository.delete(userId);
	}
}
