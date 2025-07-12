import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
	constructor(private readonly userService: UserService) {}

	async findAllUsers(req: Request, res: Response): Promise<void> {
		const users = await this.userService.findAllUsers();
		res.status(200).json({
			status: "success",
			results: users.length,
			data: { users },
		});
	}

	async findUserById(req: Request, res: Response): Promise<void> {
		const user = await this.userService.findUserById(req.params.id);
		res.status(200).json({
			status: "success",
			data: { user },
		});
	}

	async createUser(req: Request, res: Response): Promise<void> {
		const user = await this.userService.createUser(req.body);
		res.status(201).json({
			status: "success",
			data: { user },
		});
	}

	async updateUser(req: Request, res: Response): Promise<void> {
		const user = await this.userService.updateUser(
			req.params.id,
			req.body,
			req.user
		);
		res.status(200).json({
			status: "success",
			data: { user },
		});
	}

	async deleteUser(req: Request, res: Response): Promise<void> {
		await this.userService.deleteUser(req.params.id, req.user);
		res.status(204).json({
			status: "success",
			data: null,
		});
	}
}
