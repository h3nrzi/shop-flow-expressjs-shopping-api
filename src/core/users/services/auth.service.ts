import crypto from "node:crypto";
import { InternalServerError } from "../../../errors/internal-server-error";
import { NotAuthorizedError } from "../../../errors/not-authorized-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { sendEmail } from "../../../utils/email";
import { verifyRefreshToken } from "../../../utils/refreshToken";
import { IForgotPasswordDto } from "../dtos/forgot.password.dto";
import { ILoginDto } from "../dtos/login.dto";
import { IResetPasswordDto } from "../dtos/reset.password.dto";
import { ISignupDto } from "../dtos/signup.dto";
import { IUserDoc } from "../user.interface";
import { UserRepository } from "../user.repository";

export class AuthService {
	constructor(private readonly userRepository: UserRepository) {}

	/**************************************************************
	 ************* @description POST HANDLERS *************
	 ******************************************************/

	async signup(signupDto: ISignupDto): Promise<IUserDoc> {
		return this.userRepository.create({
			email: signupDto.email,
			name: signupDto.name,
			password: signupDto.password,
			passwordConfirmation: signupDto.passwordConfirmation,
		});
	}

	async login(loginDto: ILoginDto): Promise<IUserDoc> {
		// check if the email is already in use, if so, throw an error
		const { email, password } = loginDto;
		const authenticatedUser =
			await this.userRepository.findByEmail(email, "+password");
		if (!authenticatedUser) {
			throw new NotAuthorizedError(
				"ایمیل یا رمز عبور اشتباه است!"
			);
		}

		// check if the user is active, if not, throw an error
		if (!authenticatedUser.active) {
			throw new NotAuthorizedError(
				"کاربری که به این ایمیل مرتبط است مسدود شده است! لطفا با پشتیبانی تماس بگیرید."
			);
		}

		// check if the password is correct, if not, throw an error
		const correct = await authenticatedUser.correctPassword(
			password
		);
		if (!correct)
			throw new NotAuthorizedError(
				"ایمیل یا رمز عبور اشتباه است!"
			);

		return authenticatedUser;
	}

	async forgotPassword(
		forgotPasswordDto: IForgotPasswordDto
	): Promise<void> {
		// check if user exists, if not, throw an error
		const user = await this.userRepository.findByEmail(
			forgotPasswordDto.email
		);
		if (!user) {
			throw new NotFoundError(
				"هیچ کاربری با این آدرس ایمیل وجود ندارد."
			);
		}

		// check if the user is active, if not, throw an error
		if (!user.active) {
			throw new NotAuthorizedError(
				"کاربری که به این ایمیل مرتبط است مسدود شده است!"
			);
		}

		// create a password reset token
		const resetToken = user.createPasswordResetToken();
		await user.save({ validateBeforeSave: false });

		// send email with the password reset token
		let url = `http://localhost:5173/reset-password/${resetToken}`;
		if (process.env.NODE_ENV === "production") {
			url = `https://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
		}

		// send email with the password reset token, if not successful, throw error
		try {
			await sendEmail(
				user.email,
				url,
				"درخواست برای ریست کردن رمز عبور"
			);
		} catch (err) {
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			await user.save({ validateBeforeSave: false });

			throw new InternalServerError(
				"در ارسال ایمیل خطایی روی داد. لطفا بعدا دوباره امتحان کنید!"
			);
		}
	}

	async refreshToken(refreshToken: string): Promise<IUserDoc> {
		if (!refreshToken) {
			throw new NotAuthorizedError(
				"توکن تازه‌سازی ارائه نشده است"
			);
		}

		// Verify refresh token
		const decoded = (await verifyRefreshToken(refreshToken)) as {
			id: string;
		};

		// Find user and validate refresh token
		const user = await this.userRepository.findById(decoded.id);
		if (
			!user ||
			user.refreshToken !== refreshToken ||
			!user.refreshTokenExpires ||
			user.refreshTokenExpires < new Date()
		) {
			throw new NotAuthorizedError(
				"توکن تازه‌سازی نامعتبر یا منقضی شده است"
			);
		}

		if (!user.active) {
			throw new NotAuthorizedError("حساب کاربری غیرفعال است");
		}

		return user;
	}

	/************************************************************
	 ************* @description PATCH HANDLERS ******************
	 ************************************************************/

	async resetPassword(
		resetPasswordDto: IResetPasswordDto,
		resetToken: string
	): Promise<IUserDoc> {
		// check if the reset token is valid, if not, throw an error
		const token = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");
		const user =
			await this.userRepository.findByPasswordRestToken(token);
		if (!user) {
			throw new NotAuthorizedError(
				"توکن نامعتبر است یا منقضی شده است!"
			);
		}

		// update the user password and reset the password reset token
		user.password = resetPasswordDto.password;
		user.passwordConfirmation =
			resetPasswordDto.passwordConfirmation;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		const updatedUser = await user.save();

		return updatedUser;
	}
}
