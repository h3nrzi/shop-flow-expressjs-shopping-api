import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { ISignupDto } from "../dtos/signup.dto";
import createSendTokenAndResponse from "../../../utils/createSendTokenAndResponse";

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async signup(req: Request, res: Response): Promise<void> {
		const user = await this.authService.signup(req.body as ISignupDto);
		createSendTokenAndResponse(user, 201, res);
	}
}
