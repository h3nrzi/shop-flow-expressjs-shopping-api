import { CreateProductDto } from "./create-product.dto";

// Partial: Make all properties optional
export interface UpdateProductDto extends Partial<CreateProductDto> {}
