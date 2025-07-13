import AppError from "../../../utils/appError";
import { ILoginDto } from "../dtos/login.dto";
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

	async login(loginDto: ILoginDto): Promise<IUserDoc> {
		// check if the email is already in use, if so, throw an error
		const { email, password } = loginDto;
		const authenticatedUser = await this.userRepository.findByEmail(
			email,
			"+password"
		);
		if (!authenticatedUser) {
			throw new AppError("ایمیل یا رمز عبور اشتباه است!", 401);
		}

		// check if the user is active, if not, throw an error
		if (!authenticatedUser.active) {
			throw new AppError(
				"کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید.",
				404
			);
		}

		// check if the password is correct, if not, throw an error
		const correct = await authenticatedUser.correctPassword(password);
		if (!correct) throw new AppError("ایمیل یا رمز عبور اشتباه است!", 401);

		return authenticatedUser;
	}
}
