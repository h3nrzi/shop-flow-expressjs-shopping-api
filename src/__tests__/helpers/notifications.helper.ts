import app from "@/app";
import mongoose from "mongoose";
import request, { Response } from "supertest";
import { NotificationType } from "../../core/notifications/infrastructure/notification.interface";
import { CreateNotificationDto } from "../../core/notifications/presentation/notification.dto";
import { getUniqueUser, loginRequest, signupRequest } from "./auth.helper";

// ===============================================
// ============ Helper Requests =================
// ===============================================

export const getNotificationsRequest = async (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get("/api/notifications");
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const getNotificationByIdRequest = async (
	id: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get(`/api/notifications/${id}`);
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const getUnreadCountRequest = async (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).get("/api/notifications/unread-count");
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const markAsReadRequest = async (
	id: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).patch(`/api/mark-read/${id}`);
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const markAllAsReadRequest = async (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).patch("/api/notifications/mark-all-read");
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const deleteNotificationRequest = async (
	id: string,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).delete(`/api/notifications/${id}`);
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const deleteAllNotificationsRequest = async (
	cookie?: string,
): Promise<Response> => {
	const req = request(app).delete("/api/notifications/delete-all");
	if (cookie) req.set("Cookie", cookie);
	return await req.send();
};

export const createNotificationRequest = async (
	body: CreateNotificationDto,
	cookie?: string,
): Promise<Response> => {
	const req = request(app).post("/api/notifications");
	if (cookie) req.set("Cookie", cookie);
	return await req.send(body);
};

export const createBulkNotificationsRequest = async (
	body: {
		userIds: string[];
		title: string;
		message: string;
		type: NotificationType;
		data?: any;
	},
	cookie?: string,
): Promise<Response> => {
	const req = request(app).post("/api/notifications/bulk");
	if (cookie) req.set("Cookie", cookie);
	return await req.send(body);
};

// ===============================================
// ============ Helper Functions =================
// ===============================================

export const getInvalidObjectId = (): string => {
	return new mongoose.Types.ObjectId().toString();
};

export const createTestUserAndGetCookie = async (
	suffix: string,
): Promise<{ cookie: string; user: any }> => {
	const user = getUniqueUser(suffix);
	await signupRequest(user);
	const loginRes = await loginRequest(user);
	const cookie = loginRes.headers["set-cookie"][0];
	return { cookie, user: loginRes.body.data.user };
};

export const createTestAdminAndGetCookie = async (
	suffix: string,
): Promise<{ cookie: string; user: any }> => {
	const user = getUniqueUser(suffix);
	await signupRequest(user);
	await loginRequest(user);

	// Manually set user as admin in database
	const { userRepository } = await import("@/core");
	const userDoc = await userRepository.findByEmail(user.email);
	userDoc!.role = "admin";
	await userDoc!.save({ validateBeforeSave: false });

	// Login again to get admin token
	const adminLoginRes = await loginRequest(user);
	const cookie = adminLoginRes.headers["set-cookie"][0];
	return { cookie, user: adminLoginRes.body.data.user };
};

export const getValidNotificationData = (
	userId: string,
): CreateNotificationDto => ({
	user: userId,
	title: "Test Notification",
	message: "This is a test notification message",
	type: "system",
	data: { testData: "test value" },
});

export const getValidBulkNotificationData = (userIds: string[]) => ({
	userIds,
	title: "Bulk Test Notification",
	message: "This is a bulk test notification message",
	type: "promotion" as NotificationType,
	data: { bulkTest: true },
});

export const getInvalidNotificationData = () => [
	{
		testCase: "User ID is not provided",
		data: {
			user: "",
			title: "Test",
			message: "Test message",
			type: "system",
		},
		expectedError: "شناسه کاربر معتبر نیست",
	},
	{
		testCase: "User ID is not a valid MongoDB ObjectId",
		data: {
			user: "invalid-id",
			title: "Test",
			message: "Test message",
			type: "system",
		},
		expectedError: "شناسه کاربر معتبر نیست",
	},
	{
		testCase: "Title is not provided",
		data: {
			user: getInvalidObjectId(),
			title: "",
			message: "Test message",
			type: "system",
		},
		expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
	},
	{
		testCase: "Title is too long",
		data: {
			user: getInvalidObjectId(),
			title: "a".repeat(201),
			message: "Test message",
			type: "system",
		},
		expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
	},
	{
		testCase: "Message is not provided",
		data: {
			user: getInvalidObjectId(),
			title: "Test",
			message: "",
			type: "system",
		},
		expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
	},
	{
		testCase: "Message is too long",
		data: {
			user: getInvalidObjectId(),
			title: "Test",
			message: "a".repeat(1001),
			type: "system",
		},
		expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
	},
	{
		testCase: "Type is invalid",
		data: {
			user: getInvalidObjectId(),
			title: "Test",
			message: "Test message",
			type: "invalid-type",
		},
		expectedError: "نوع اعلان معتبر نیست",
	},
	{
		testCase: "Data is not an object",
		data: {
			user: getInvalidObjectId(),
			title: "Test",
			message: "Test message",
			type: "system",
			data: "invalid-data",
		},
		expectedError: "داده‌های اضافی باید از نوع آبجکت باشد",
	},
];

export const getInvalidBulkNotificationData = () => [
	{
		testCase: "UserIds is not provided",
		data: {
			userIds: [],
			title: "Test",
			message: "Test message",
			type: "system",
		},
		expectedError: "لیست شناسه کاربران الزامی است",
	},
	{
		testCase: "UserIds contains invalid ObjectId",
		data: {
			userIds: ["invalid-id"],
			title: "Test",
			message: "Test message",
			type: "system",
		},
		expectedError: "شناسه کاربر معتبر نیست",
	},
	{
		testCase: "Title is not provided",
		data: {
			userIds: [getInvalidObjectId()],
			title: "",
			message: "Test message",
			type: "system",
		},
		expectedError: "عنوان اعلان الزامی است و باید بین ۱ تا ۲۰۰ کاراکتر باشد",
	},
	{
		testCase: "Message is not provided",
		data: {
			userIds: [getInvalidObjectId()],
			title: "Test",
			message: "",
			type: "system",
		},
		expectedError: "پیام اعلان الزامی است و باید بین ۱ تا ۱۰۰۰ کاراکتر باشد",
	},
	{
		testCase: "Type is invalid",
		data: {
			userIds: [getInvalidObjectId()],
			title: "Test",
			message: "Test message",
			type: "invalid-type",
		},
		expectedError: "نوع اعلان معتبر نیست",
	},
];

export const expectValidNotificationResponse = (
	notification: any,
	expectedData?: Partial<CreateNotificationDto>,
) => {
	expect(notification).toBeDefined();
	expect(notification._id).toBeDefined();
	expect(notification.user).toBeDefined();
	expect(notification.title).toBeDefined();
	expect(notification.message).toBeDefined();
	expect(notification.type).toBeDefined();
	expect(notification.isRead).toBe(false);
	expect(notification.createdAt).toBeDefined();
	expect(notification.updatedAt).toBeDefined();

	if (expectedData) {
		if (expectedData.title) expect(notification.title).toBe(expectedData.title);
		if (expectedData.message)
			expect(notification.message).toBe(expectedData.message);
		if (expectedData.type) expect(notification.type).toBe(expectedData.type);
		if (expectedData.data) expect(notification.data).toEqual(expectedData.data);
	}
};
