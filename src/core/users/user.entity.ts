import { model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserDoc, IUserModel } from "./user.interface";
import crypto from "node:crypto";
import ms from "ms";

const userSchema = new Schema<IUserDoc>(
	{
		name: {
			type: String,
			required: [true, "نام کاربر الزامی است"],
		},
		email: {
			type: String,
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, "لطفا یک آدرس ایمیل معتبر وارد کنید"],
			required: [true, "لطفا آدرس ایمیل خود را وارد کنید"],
		},
		photo: {
			type: String,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		active: {
			type: Boolean,
			default: true,
		},

		password: {
			type: String,
			select: false,
			minLength: 8,
			required: [true, "لطفا رمز عبور خود را وارد کنید"],
		},
		passwordConfirmation: {
			type: String,
			minLength: 8,
			validate: {
				validator: function (this: IUserDoc, value: string): boolean {
					return value === this.password;
				},
				message: "رمزهای عبور یکسان نیستند!",
			},
			required: [true, "لطفا تایید رمز عبور خود را وارد کنید"],
		},
		passwordChangedAt: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetExpires: {
			type: Date,
		},
	},
	{
		toJSON: {
			virtuals: true,
			transform(doc, ret) {
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
		toObject: { virtuals: true },
		timestamps: true,
	}
);

//////////// Instance Methods ////////////

userSchema.methods.signToken = function (): string {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

userSchema.methods.correctPassword = async function (
	this: IUserDoc,
	candidate_password: string
) {
	return await bcrypt.compare(candidate_password, this.password);
};

userSchema.methods.changePasswordAfter = function (
	this: IUserDoc,
	jwtTimeStamp: number
) {
	return this.passwordChangedAt
		? this.passwordChangedAt.getTime() / 1000 >= jwtTimeStamp
		: false;
};

userSchema.methods.createPasswordResetToken = function (this: IUserDoc) {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");
	this.passwordResetExpires = Date.now() + ms("10m");
	return resetToken;
};

//////////// Query Middleware ////////////

// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   next();
// });

//////////// Document Middleware ////////////

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password, 12);
		this.passwordConfirmation = undefined;
		return next();
	}
	return next();
});

userSchema.pre("save", async function (next) {
	if (this.isModified("password") && !this.isNew) {
		let currentTime = new Date();
		currentTime.setSeconds(currentTime.getSeconds() - 2);
		this.passwordChangedAt = currentTime;
		return next();
	}
	return next();
});

const User = model<IUserDoc, IUserModel>("User", userSchema);
export default User;
