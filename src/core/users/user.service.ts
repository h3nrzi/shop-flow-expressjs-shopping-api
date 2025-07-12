import { ICreateUserDto } from "./dtos/create-user.dto";
import { IUpdateUserDto } from "./dtos/update-user.dto";
import { IUserDoc } from "./interfaces/user.interface";
import { UserRepository } from "./user.repository";
import AppError from "../../utils/appError";

export class UserService {
	constructor(private readonly userRepository: UserRepository) {}

	async findAllUsers(): Promise<IUserDoc[]> {
		return this.userRepository.findAll();
	}

	async findUserById(userId: string): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.userRepository.findById(userId);
		if (!targetUser) {
			throw new AppError("هیچ موردی با این شناسه یافت نشد", 404);
		}

		return targetUser;
	}

	async findUsersCountByDay(period: string): Promise<any> {
		let startDate: Date | undefined;
		const endDate = new Date();

		switch (period) {
			case "week":
				startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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
				throw new AppError("زمان وارد شده نامعتبر است", 400);
		}

		this.userRepository.findCountByDay(endDate, startDate);
	}

	async createUser(createUserDto: ICreateUserDto): Promise<IUserDoc> {
		// check if the email is already in use, if so, throw an error
		const targetUser = await this.userRepository.findByEmail(
			createUserDto.email
		);
		if (targetUser) {
			throw new AppError("این ایمیل قبلا استفاده شده است", 400);
		}

		return this.userRepository.create(createUserDto);
	}

	async updateUser(
		userId: string,
		updateUserDto: IUpdateUserDto,
		currentUser: IUserDoc
	): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.userRepository.findById(userId);
		if (!targetUser) {
			throw new AppError("هیچ موردی با این شناسه یافت نشد", 404);
		}

		// if the user is admin, only main admin can update the user
		if (targetUser.role === "admin") {
			if (currentUser.email !== "admin@gmail.com") {
				throw new AppError(
					"شما نمی توانید حساب ادمین را آپدیت کنید فقط مدیر سیستم می تواند این کار را انجام دهد",
					401
				);
			}
		}

		return this.userRepository.update(userId, updateUserDto);
	}

	async deleteUser(
		userId: string,
		currentUser: IUserDoc
	): Promise<IUserDoc | null> {
		// find the user, if not found, throw an error
		const targetUser = await this.userRepository.findById(userId);
		if (!targetUser) {
			throw new AppError("هیچ موردی با این شناسه یافت نشد", 404);
		}

		// check if the user is the same as the current user
		if (targetUser.email === currentUser.email) {
			throw new AppError("شما نمی توانید حساب خود را حذف کنید", 401);
		}

		// if the user is admin, only main admin can delete the user
		if (targetUser.role === "admin") {
			if (currentUser.email !== "admin@gmail.com") {
				throw new AppError(
					"شما نمی توانید حساب ادمین را حذف کنید فقط مدیر سیستم می تواند این کار را انجام دهد",
					401
				);
			}
		}

		return this.userRepository.delete(userId);
	}
}
