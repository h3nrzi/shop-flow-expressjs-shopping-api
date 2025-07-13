import AppError from "../../../utils/appError";
import { ISignupDto } from "../dtos/signup.dto";
import { IUserDoc } from "../user.interface";
import { UserRepository } from "../user.repository";

export class AuthService {
	constructor(private readonly userRepository: UserRepository) {}

	async signup(signupDto: ISignupDto): Promise<IUserDoc> {
		// check if the email is already in use, if so, throw an error
		const { name, email, password, passwordConfirmation } = signupDto;
		const existingUser = await this.userRepository.findByEmail(email);
		if (existingUser) {
			throw new AppError("این ایمیل قبلا استفاده شده است", 400);
		}

		// create the user and return it
		return await this.userRepository.create({
			name,
			email,
			password,
			passwordConfirmation,
		});
	}
}
