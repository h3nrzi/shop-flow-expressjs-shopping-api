import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";
import ms from "ms";
import crypto from "node:crypto";
import { IUserDoc, IUserModel } from "./user.interface";

const userSchema = new Schema<IUserDoc>(
	{
		name: { type: String, required: true },
		email: {
			type: String,
			unique: true,
			lowercase: true,
			required: true,
		},
		photo: { type: String },
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		active: { type: Boolean, default: true },

		password: {
			type: String,
			select: false,
			minLength: 8,
			required: true,
		},
		passwordConfirmation: {
			type: String,
			minLength: 8,
			validate: {
				validator: function (this: IUserDoc, value: string): boolean {
					return value === this.password;
				},
			},
			required: true,
		},

		passwordChangedAt: { type: Date },
		passwordResetToken: { type: String },
		passwordResetExpires: { type: Date },
		refreshToken: { type: String },
		refreshTokenExpires: { type: Date },
	},
	{
		toJSON: {
			virtuals: true,
			transform(doc, ret) {
				delete ret._id;
				delete ret.__v;
				delete ret.passwordResetExpires;
				delete ret.passwordResetToken;
				delete ret.refreshToken;
				delete ret.refreshTokenExpires;
				return ret;
			},
		},
		toObject: { virtuals: true },
		timestamps: true,
	},
);

//////////// Instance Methods ////////////

userSchema.methods.signToken = function (): string {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

userSchema.methods.signRefreshToken = function (): string {
	return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET!, {
		expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
	});
};

userSchema.methods.correctPassword = async function (
	this: IUserDoc,
	candidate_password: string,
) {
	return await bcrypt.compare(candidate_password, this.password);
};

userSchema.methods.changePasswordAfter = function (
	this: IUserDoc,
	jwtTimeStamp: number,
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
	this.passwordResetExpires =
		Date.now() + ms(process.env.PASSWORD_RESET_EXPIRES_IN!);
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
export { User };
