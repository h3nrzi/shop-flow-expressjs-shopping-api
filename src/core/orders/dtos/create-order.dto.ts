export interface CreateOrderDto {
	orderItems: { product: string; qty: number }[];
	shippingAddress: { province: string; city: string; street: string };
	paymentMethod: string;
	itemsPrice: number;
	shippingPrice: number;
	taxPrice: number;
	totalPrice: number;
}
