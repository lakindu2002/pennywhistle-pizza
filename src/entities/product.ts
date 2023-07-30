export enum ProductSize {
  SMALL = "small",
  REGULAR = "regular",
  LARGE = "large",
}

export enum ProductType {
  THIN_CRUST = "thin_crust",
  THICK_CRUST = "thick_crust",
  SASUAGE_CRUST = "sasuage_crust",
}

export interface ProductSchema {
  baseSku: string;
  variantSku: string;
}

export interface Product extends ProductSchema {
  name: string;
}

export interface ProductVariant extends ProductSchema {
  price: number;
  size: ProductSize;
  type: ProductType;
}
