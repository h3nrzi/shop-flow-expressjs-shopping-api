import mongoose from "mongoose";

export interface IUserDoc extends mongoose.Document {
	// Instance properties
	name: string;
	email: string;
	photo?: string;
	role: "user" | "admin"; // default: user
	active: boolean; // default: true
	password: string;
	passwordConfirmation?: string;
	passwordChangedAt?: Date;
	passwordResetToken?: String;
	passwordResetExpires?: Number;

	// Instance methods
	correctPassword: (
		candidate_password: string,
	) => Promise<boolean>;
	signToken: () => string;
	changePasswordAfter: (jwtTimeStamp: number) => boolean;
	createPasswordResetToken: () => string;
}

export interface IUserModel extends mongoose.Model<IUserDoc> {}
