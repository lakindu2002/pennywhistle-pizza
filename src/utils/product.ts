import { ProductSize } from "@pizza/entities";

export class ProductUtil {
  static generateVariantSku(baseSku: string, size: ProductSize) {
    return `${baseSku.toUpperCase()}_${size.toUpperCase()}`;
  }
}
