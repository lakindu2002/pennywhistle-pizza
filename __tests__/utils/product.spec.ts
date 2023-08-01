import { ProductSize } from "@pizza/entities";
import { ProductUtil } from "../../src/utils/product";

describe("ProductUtil", () => {
  describe("generateVariantSku", () => {
    it("should generate a variant SKU with the base SKU and size", () => {
      const baseSku = "ABC123";
      const size: ProductSize = ProductSize.LARGE;
      const expectedSku = "ABC123_LARGE";

      const variantSku = ProductUtil.generateVariantSku(baseSku, size);

      expect(variantSku).toBe(expectedSku);
    });

    it("should convert base SKU and size to uppercase", () => {
      const baseSku = "abc123";
      const size: string = ProductSize.REGULAR.toLowerCase();
      const expectedSku = "ABC123_REGULAR";

      const variantSku = ProductUtil.generateVariantSku(baseSku, size as any);

      expect(variantSku).toBe(expectedSku);
    });
  });
});
