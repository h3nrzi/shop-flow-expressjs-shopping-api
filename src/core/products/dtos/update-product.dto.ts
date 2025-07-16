import { CreateProductDto } from "./create-product.dto";

export interface UpdateProductDto extends Partial<CreateProductDto> {}
