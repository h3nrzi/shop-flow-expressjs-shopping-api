import { getInvalidToken } from "@/__tests__/helpers/auth.helper";
import {
	deleteOrderRequest,
	createTestUserAndGetCookie,
	createTestOrder,
	getInvalidId,
	getInvalidObjectId,
} from "@/__tests__/helpers/orders.helper";

describe("DELETE /api/orders/:id (Admin Only)", () => {
	let userCookie: string;
	let adminCookie: string;
	let user: any;
	let order: any;

	beforeEach(async () => {
		const testUser = await createTestUserAndGetCookie(
			"orderuser"
		);
		userCookie = testUser.cookie;
		user = testUser.user;

		const testAdmin = await createTestUserAndGetCookie(
			"admin",
			"admin"
		);
		adminCookie = testAdmin.cookie;

		// Create a test order for the user
		order = await createTestOrder(user._id.toString());
	});

	describe("should return 401, if", () => {
		it("user is not authenticated (no token)", async () => {
			const res = await deleteOrderRequest(order._id.toString());

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"شما وارد نشده اید! لطفا برای دسترسی وارد شوید"
			);
		});

		it("user is not authenticated (invalid token)", async () => {
			const invalidCookie = `jwt=${getInvalidToken()}`;
			const res = await deleteOrderRequest(
				order._id.toString(),
				invalidCookie
			);

			expect(res.status).toBe(401);
			expect(res.body.errors[0].message).toBe(
				"کاربر متعلق به این توکن دیگر وجود ندارد!"
			);
		});
	});

	describe("should return 400, if", () => {
		it("order ID is not a valid ObjectId", async () => {
			const res = await deleteOrderRequest(
				getInvalidId(),
				adminCookie
			);

			expect(res.status).toBe(400);
		});
	});

	describe("should return 403, if", () => {
		it("regular user tries to access admin endpoint", async () => {
			const res = await deleteOrderRequest(
				order._id.toString(),
				userCookie
			);

			expect(res.status).toBe(403);
		});
	});

	describe("should return 404, if", () => {
		it("order does not exist", async () => {
			const nonExistentOrderId = getInvalidObjectId();
			const res = await deleteOrderRequest(
				nonExistentOrderId,
				adminCookie
			);

			expect(res.status).toBe(404);
		});
	});

	describe("should return 204, if", () => {
		it("admin successfully deletes order", async () => {
			const res = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");
		});

		it("admin can delete any user's order", async () => {
			// Create another user and their order
			const otherUser = await createTestUserAndGetCookie(
				"otheruser"
			);
			const otherOrder = await createTestOrder(
				otherUser.user._id.toString()
			);

			const res = await deleteOrderRequest(
				otherOrder._id.toString(),
				adminCookie
			);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");
		});

		it("deleting non-existent order after successful deletion returns 404", async () => {
			// First delete the order
			const deleteRes = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);
			expect(deleteRes.status).toBe(204);

			// Try to delete the same order again
			const secondDeleteRes = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);
			expect(secondDeleteRes.status).toBe(404);
		});

		it("admin can delete multiple orders", async () => {
			// Create additional orders
			const order2 = await createTestOrder(user._id.toString());
			const order3 = await createTestOrder(user._id.toString());

			// Delete first order
			const res1 = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);
			expect(res1.status).toBe(204);

			// Delete second order
			const res2 = await deleteOrderRequest(
				order2._id.toString(),
				adminCookie
			);
			expect(res2.status).toBe(204);

			// Delete third order
			const res3 = await deleteOrderRequest(
				order3._id.toString(),
				adminCookie
			);
			expect(res3.status).toBe(204);
		});

		it("admin can delete orders with different statuses", async () => {
			// Create orders with different characteristics
			const paidOrder = await createTestOrder(
				user._id.toString(),
				undefined,
				{
					itemsPrice: 50000,
					totalPrice: 60000,
				}
			);

			const deliveredOrder = await createTestOrder(
				user._id.toString(),
				undefined,
				{
					itemsPrice: 30000,
					totalPrice: 35000,
				}
			);

			// Delete orders regardless of their status
			const res1 = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);
			expect(res1.status).toBe(204);

			const res2 = await deleteOrderRequest(
				paidOrder._id.toString(),
				adminCookie
			);
			expect(res2.status).toBe(204);

			const res3 = await deleteOrderRequest(
				deliveredOrder._id.toString(),
				adminCookie
			);
			expect(res3.status).toBe(204);
		});

		it("response body contains success status", async () => {
			const res = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);

			expect(res.status).toBe(204);
			expect(res.body).toEqual({
				status: "success",
			});
		});

		it("admin can delete order immediately after creation", async () => {
			// Create a new order and delete it immediately
			const newOrder = await createTestOrder(
				user._id.toString()
			);
			const res = await deleteOrderRequest(
				newOrder._id.toString(),
				adminCookie
			);

			expect(res.status).toBe(204);
			expect(res.body.status).toBe("success");
		});

		it("admin can delete orders from different users", async () => {
			// Create orders for multiple users
			const user2 = await createTestUserAndGetCookie("user2");
			const user3 = await createTestUserAndGetCookie("user3");

			const order2 = await createTestOrder(
				user2.user._id.toString()
			);
			const order3 = await createTestOrder(
				user3.user._id.toString()
			);

			// Admin can delete all orders
			const res1 = await deleteOrderRequest(
				order._id.toString(),
				adminCookie
			);
			expect(res1.status).toBe(204);

			const res2 = await deleteOrderRequest(
				order2._id.toString(),
				adminCookie
			);
			expect(res2.status).toBe(204);

			const res3 = await deleteOrderRequest(
				order3._id.toString(),
				adminCookie
			);
			expect(res3.status).toBe(204);
		});
	});
});
