import { ICreateUserDto } from "../dtos/create-user.dto";
import { IUserDoc } from "../user.interface";
import { UserRepository } from "../user.repository";

export class AuthService {
	constructor(private readonly userRepository: UserRepository) {}

	async signup(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		return this.userRepository.create(createUserDto);
	}
}
