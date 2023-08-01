import { ProductCreateRequest } from "../../src/dto";
import { ProductSize, ProductType } from "../../src/entities";
import { ProductService } from "../../src/api/services";
import { configDotenv } from "dotenv";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

describe("ProductService", () => {
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  it("should create a new product", async () => {
    const createRequest: ProductCreateRequest = {
      name: "New Product",
      sku: "PIZZA_NEW",
      variants: [
        {
          price: 99,
          size: ProductSize.LARGE,
          type: ProductType.THIN_CRUST,
        },
        {
          price: 79,
          size: ProductSize.REGULAR,
          type: ProductType.THIN_CRUST,
        },
      ],
    };

    const result = await ProductService.createProduct(createRequest);

    expect(result.product).toBeDefined();
    expect(result.product.variants).toHaveLength(2);
  });

  it("should get all products", async () => {
    const result = await ProductService.getAllProducts();

    expect(result.products).toHaveLength(1);
    // testing from mock data initially inserted.
    expect(result.products[0].name).toBe("Margerita Pizza");
    expect(result.products[0].variants).toHaveLength(3);
  });

  it("should delete a product by SKU", async () => {
    const createRequest: ProductCreateRequest = {
      name: "New Product",
      sku: "PIZZA_NEW",
      variants: [
        {
          price: 99,
          size: ProductSize.LARGE,
          type: ProductType.THIN_CRUST,
        },
        {
          price: 79,
          size: ProductSize.REGULAR,
          type: ProductType.THIN_CRUST,
        },
      ],
    };

    await ProductService.createProduct(createRequest);

    const skuToDelete = "PIZZA_NEW";

    await ProductService.deleteProductBySku(skuToDelete);

    const result = await ProductService.getAllProducts();
    expect(result.products).toHaveLength(1);
  });
});
