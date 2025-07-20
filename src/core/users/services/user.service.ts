import { BadRequestError } from "../../../errors/bad-request-error";
import { NotAuthorizedError } from "../../../errors/not-authorized-error";
import { NotFoundError } from "../../../errors/not-found-error";
import { ICreateUserDto } from "../dtos/create-user.dto";
import { IUpdateCurrentUserInfoDto } from "../dtos/update-currentuser-info.dto";
import { IUpdateCurrentUserPasswordDto } from "../dtos/update-currentuser-password.dto";
import { IUpdateUserDto } from "../dtos/update-user.dto";
import { IUserDoc } from "../user.interface";
import { UserRepository } from "../user.repository";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	/******************************************************
	 ************* @description GET HANDLERS *************
	 ******************************************************/

	async findAllUsers(): Promise<IUserDoc[]> {
		return this.userRepository.findAll();
	}

	async findUserById(
		userId: string,
		select?: string
	): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.userRepository.findById(
			userId,
			select
		);
		if (!targetUser) {
			throw new NotFoundError("هیچ موردی با این شناسه یافت نشد");
		}

		return targetUser;
	}

	async findUsersCountByDay(
		period: string
	): Promise<{ count: number; date: Date }[]> {
		let startDate: Date | undefined;
		const endDate = new Date();

		switch (period) {
			case "week":
				startDate = new Date(
					Date.now() - 7 * 24 * 60 * 60 * 1000
				);
				break;
			case "month":
				startDate = new Date();
				startDate.setMonth(startDate.getMonth() - 1);
				break;
			case "year":
				startDate = new Date();
				startDate.setFullYear(startDate.getFullYear() - 1);
				break;
			case "all":
				startDate = undefined;
				break;
			default:
				throw new BadRequestError("زمان وارد شده نامعتبر است");
		}

		return this.userRepository.findCountByDay(
			endDate,
			startDate
		);
	}

	/******************************************************
	 ************* @description POST HANDLERS *************
	 ******************************************************/

	async createUser(
		createUserDto: ICreateUserDto
	): Promise<IUserDoc> {
		// check if the email is already in use, if so, throw an error
		const targetUser = await this.userRepository.findByEmail(
			createUserDto.email
		);
		if (targetUser) {
			throw new BadRequestError(
				"این ایمیل قبلا استفاده شده است"
			);
		}

		return this.userRepository.create(createUserDto);
	}

	/*******************************************************
	 ************* @description PATCH HANDLERS *************
	 *******************************************************/

	async updateUser(
		userId: string,
		updateUserDto: IUpdateUserDto,
		currentUser: IUserDoc
	): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.findUserById(userId);

		// if the user is admin, only main admin can update the user
		if (targetUser!.role === "admin") {
			if (currentUser.email !== "admin@gmail.com") {
				throw new NotAuthorizedError(
					"شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
				);
			}
		}

		return this.userRepository.update(userId, updateUserDto);
	}

	async updateCurrentUserInfo(
		currentUser: IUserDoc,
		updateUserDto: IUpdateCurrentUserInfoDto
	): Promise<IUserDoc | null> {
		// if password or passwordConfirmation is provided, throw an error
		if (
			updateUserDto.password ||
			updateUserDto.passwordConfirmation
		) {
			throw new BadRequestError(
				"با این درخواست نمی توانید رمز عبور را آپدیت کنید"
			);
		}

		const updatedUser = await this.userRepository.update(
			currentUser.id,
			{
				name: updateUserDto.name ?? currentUser.name,
				email: updateUserDto.email ?? currentUser.email,
				photo: updateUserDto.photo ?? currentUser.photo,
			}
		);

		return updatedUser;
	}

	async updateCurrentUserPassword(
		currentUser: IUserDoc,
		updateCurrentUserPasswordDto: IUpdateCurrentUserPasswordDto
	): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.findUserById(
			currentUser.id,
			"+password"
		);

		// check if the password current is correct
		const correct = await targetUser!.correctPassword(
			updateCurrentUserPasswordDto.passwordCurrent
		);
		if (!correct) {
			throw new NotAuthorizedError(
				"رمز عبور فعلی شما اشتباه است"
			);
		}

		// ---- UPDATE PASSWORD MANUALLY ----
		// we cannot use this approach: "this.userRepository.update()",
		// because userRepository.update() use findByIdAndUpdate() method
		// which does not access the password field in validate function for passwordConfirmation
		// so we need to update the password manually
		const { password, passwordConfirmation } =
			updateCurrentUserPasswordDto;
		targetUser!.password = password;
		targetUser!.passwordConfirmation = passwordConfirmation;
		await targetUser!.save();

		return targetUser;
	}

	/*******************************************************
	 ************* @description DELETE HANDLERS ************
	 *******************************************************/

	async deleteUser(
		userId: string,
		currentUser: IUserDoc
	): Promise<void> {
		// find the user, if not found, throw an error
		const targetUser = await this.findUserById(userId);

		// if the user is admin, only main admin can delete the user
		if (targetUser!.role === "admin") {
			if (currentUser.email !== "admin@gmail.com") {
				throw new NotAuthorizedError(
					"شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد"
				);
			}
		}

		await this.userRepository.delete(userId);
	}

	async deleteCurrentUser(currentUser: IUserDoc): Promise<void> {
		await this.userRepository.delete(currentUser.id);
	}
}
