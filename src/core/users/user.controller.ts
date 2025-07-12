import { Request, Response } from "express";
import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateCurrentUserInfoDto } from "./dtos/update-currentuser-info.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";
import { UserService } from "./user.service";

export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 ************* @description GET HANDLERS *************
	 */

	async findAllUsers(req: Request, res: Response): Promise<void> {
		const users = await this.userService.findAllUsers();
		res.status(200).json({
			status: "success",
			results: users.length,
			data: { users },
		});
	}

	async findUsersCountByDay(req: Request, res: Response): Promise<void> {
		const period = req.query.period as string | undefined;
		const usersCountByDay = await this.userService.findUsersCountByDay(
			period ?? "all"
		);

		res.status(200).json({
			status: "success",
			results: usersCountByDay.length,
			data: { usersCountByDay },
		});
	}

	async findUserById(req: Request, res: Response): Promise<void> {
		const user = await this.userService.findUserById(req.params.id);
		res.status(200).json({
			status: "success",
			data: { user },
		});
	}

	async getCurrentUser(req: Request, res: Response): Promise<void> {
		const currentUser = req.user;
		res.status(200).json({
			status: "success",
			data: { currentUser },
		});
	}

	/**
	 ************* @description POST HANDLERS *************
	 */

	async createUser(req: Request, res: Response): Promise<void> {
		const user = await this.userService.createUser(req.body as ICreateUserDto);
		res.status(201).json({
			status: "success",
			data: { user },
		});
	}

	/**
	 ************* @description PATCH HANDLERS *************
	 */

	async updateUser(req: Request, res: Response): Promise<void> {
		const user = await this.userService.updateUser(
			req.params.id,
			req.body as IUpdateUserDto,
			req.user
		);
		res.status(200).json({
			status: "success",
			data: { user },
		});
	}

	async updateCurrentUserInfo(req: Request, res: Response): Promise<void> {
		const updatedUser = await this.userService.updateCurrentUserInfo(
			req.user,
			req.body as IUpdateCurrentUserInfoDto
		);
		res.status(200).json({
			status: "success",
			data: { updatedUser },
		});
	}

	// async updateCurrentUserPassword(req: Request, res: Response): Promise<void> {
	// 	const updatedUser = await this.userService.updateCurrentUserPassword(
	// 		req.user,
	// 		req.body as IUpdateCurrentUserPasswordDto
	// 	);
	// 	res.status(200).json({
	// 		status: "success",
	// 		data: { updatedUser },
	// 	});
	// }

	/**
	 ************* @description DELETE HANDLERS *************
	 */

	async deleteUser(req: Request, res: Response): Promise<void> {
		await this.userService.deleteUser(req.params.id, req.user);
		res.status(204).json({
			status: "success",
			data: null,
		});
	}

	async deleteCurrentUser(req: Request, res: Response): Promise<void> {
		await this.userService.deleteUser(req.user.id, req.user);
		res.status(204).json({
			status: "success",
			data: null,
		});
	}
}
