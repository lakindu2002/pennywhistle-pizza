import { ProductSize } from "@pizza/entities";
import { ProductType } from "@pizza/entities/product";

export interface ProductVariantDTO {
  price: number;
  size: ProductSize;
  type: ProductType;
}

export interface ProductCreateRequest {
  name: string;
  sku: string;
  variants: ProductVariantDTO[];
}
