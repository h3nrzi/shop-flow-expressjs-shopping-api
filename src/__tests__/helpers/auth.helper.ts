import request, { Response } from "supertest";
import app from "@/app";
import { IForgotPasswordDto } from "../../core/users/dtos/forgot.password.dto";
import { ILoginDto } from "../../core/users/dtos/login.dto";
import { IResetPasswordDto } from "../../core/users/dtos/reset.password.dto";
import { ISignupDto } from "../../core/users/dtos/signup.dto";
import { sendEmail } from "@/utils/email";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// ===============================================
// ============ Helper Requests =================
// ===============================================

export const signupRequest = async (
	body: ISignupDto
): Promise<Response> => {
	return await request(app).post("/api/users/signup").send(body);
};

export const loginRequest = async (
	body: ILoginDto
): Promise<Response> => {
	return await request(app).post("/api/users/login").send(body);
};

export const logoutRequest = async (
	cookie: string
): Promise<Response> => {
	return await request(app)
		.post("/api/users/logout")
		.set("Cookie", cookie);
};

export const forgotPasswordRequest = async (
	body: IForgotPasswordDto
): Promise<Response> => {
	return await request(app)
		.post("/api/users/forgot-password")
		.send(body);
};

export const resetPasswordRequest = async (
	body: IResetPasswordDto,
	query: { resetToken: string }
): Promise<Response> => {
	return await request(app)
		.patch(
			`/api/users/reset-password?resetToken=${query.resetToken}`
		)
		.send(body);
};

// ===============================================
// ============ Helper Functions =================
// ===============================================

interface IValidUser {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
}

export const getInvalidToken = (): string => {
	const id = new mongoose.Types.ObjectId().toString();
	return jwt.sign({ id }, process.env.JWT_SECRET!, {
		expiresIn: process.env.JWT_EXPIRES_IN!,
	});
};

export const getUniqueUser = (suffix: string): IValidUser => ({
	name: "test",
	email: `test${suffix}@test.com`,
	password: "test123456",
	passwordConfirmation: "test123456",
});

export const signupAndRequestForgotPassword = async (
	user: IValidUser
): Promise<string> => {
	// Make the request to signup
	await signupRequest(user);

	// Make the request to forgot password
	await forgotPasswordRequest({ email: user.email });

	// Get the reset token from the mocked email
	const mockSendEmail = sendEmail as jest.MockedFunction<
		typeof sendEmail
	>;
	const emailCall = mockSendEmail.mock.calls[0];
	const url = emailCall[1] as string;

	// Return the reset token
	return url.split("/").pop()!;
};
