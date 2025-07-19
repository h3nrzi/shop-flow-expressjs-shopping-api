export interface CreateOrderDto {
	orderItems: { productId: string; qty: number }[];
	shippingAddress: {
		province: string;
		city: string;
		street: string;
	};
	paymentMethod: string;
	itemsPrice: number;
	shippingPrice: number;
	taxPrice: number;
	totalPrice: number;
}
