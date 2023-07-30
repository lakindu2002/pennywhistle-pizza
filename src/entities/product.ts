export enum ProductSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export interface Product {
  id: string;
  name: string;
  baseSku: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  sku: string;
  price: number;
  variantSku: string;
}
