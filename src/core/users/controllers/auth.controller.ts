import { Request, Response } from "express";
import ms from "ms";
import createSendTokenAndResponse from "../../../utils/createSendTokenAndResponse";
import { IForgotPasswordDto } from "../dtos/forgot.password.dto";
import { ILoginDto } from "../dtos/login.dto";
import { IResetPasswordDto } from "../dtos/reset.password.dto";
import { ISignupDto } from "../dtos/signup.dto";
import { AuthService } from "../services/auth.service";

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/************************************************************
	 ************* @description POST HANDLERS *******************
	 ************************************************************/

	async signup(req: Request, res: Response): Promise<void> {
		const user = await this.authService.signup(req.body as ISignupDto);
		createSendTokenAndResponse(user, 201, res);
	}

	async login(req: Request, res: Response): Promise<void> {
		const user = await this.authService.login(req.body as ILoginDto);
		createSendTokenAndResponse(user, 200, res);
	}

	async logout(req: Request, res: Response): Promise<void> {
		res.cookie("jwt", "", {
			expires: new Date(Date.now() + ms(process.env.JWT_COOKIE_EXPIRES_IN!)),
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
			sameSite: "lax",
		});
		res.status(204).header("x-auth-token", "").json({});
	}

	async forgotPassword(req: Request, res: Response): Promise<void> {
		// Send email to user with reset password link,
		// if the email is not sent, throw error
		await this.authService.forgotPassword(req.body as IForgotPasswordDto);

		res.status(200).json({
			status: "success",
			message: "رمز با موفقیت به ایمیل ارسال شد!",
		});
	}

	/************************************************************
	 ************* @description PATCH HANDLERS ******************
	 ************************************************************/

	async resetPassword(req: Request, res: Response): Promise<void> {
		const user = await this.authService.resetPassword(
			req.body as IResetPasswordDto,
			req.query.resetToken as string,
		);
		createSendTokenAndResponse(user, 200, res);
	}
}
