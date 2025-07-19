import { CreateOrderDto } from "./create-order.dto";

export interface UpdateOrderDto
	extends Partial<CreateOrderDto> {}
