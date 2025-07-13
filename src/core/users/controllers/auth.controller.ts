import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
	constructor(private readonly authService: AuthService) {}

	async signup(req: Request, res: Response): Promise<void> {
		const user = await this.authService.signup(req.body);
		res.status(201).json({
			status: "success",
			data: { user },
		});
	}
}
