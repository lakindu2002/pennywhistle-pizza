import request from "supertest";
import server from "../../src/server/index";
import { configDotenv } from "dotenv";
import { AuthService } from "../../src/api/services";
import { ProductVariantDTO } from "../../src/dto";
import { ProductSize, ProductType } from "../../src/entities";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

const app = server.getServer();

describe("POST /products", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should create a product when valid data is provided", async () => {
    const mockProduct = {
      name: "Product Name",
      sku: "SKU123",
      variants: [
        {
          price: 39,
          size: ProductSize.LARGE,
          type: ProductType.SASUAGE_CRUST,
        },
      ] as ProductVariantDTO[],
    };

    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProduct);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "PRODUCT_CREATED");
    expect(response.body).toHaveProperty("product");
  });

  it("should return an error when the product already exists", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const mockProduct = {
      name: "Product Name",
      sku: "SKU123",
      variants: [
        {
          price: 39,
          size: ProductSize.LARGE,
          type: ProductType.SASUAGE_CRUST,
        },
      ] as ProductVariantDTO[],
    };

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProduct);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty(
      "message",
      "The product already exists."
    );
  });
});

describe("POST /products/find", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should get a list of products", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const response = await request(app)
      .post("/products/find")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("products");
  });
});

describe("PATCH /products/update", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });
  it("should update the product attributes", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const mockProductUpdate = {
      baseSku: "SKU123",
      isVariantUpdate: false,
      updatedAttributes: {
        name: "Testing Name",
      },
    };

    const response = await request(app)
      .patch("/products/update")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProductUpdate);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Product updated successfully."
    );
  });
});

describe("POST /products/delete", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should show error when trying to delete the product by SKU that does not exist", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const mockProductToDelete = {
      productId: "SKU123",
    };
    const response = await request(app)
      .post("/products/delete")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProductToDelete);
    expect(response.body).toHaveProperty("message", "Product does not exist");
  });

  it("should delete product successfully", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );

    const mockProductToDelete = {
      productId: "MARGERITA_PIZZA",
    };
    const response = await request(app)
      .post("/products/delete")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProductToDelete);
    expect(response.body).toHaveProperty("message", "PRODUCT_DELETED");
  });

  it("should not let unauthorized users to delete", async () => {
    const adminUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );

    const mockProductToDelete = {
      productId: "MARGERITA",
    };
    const response = await request(app)
      .post("/products/delete")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(mockProductToDelete);
    expect(response.status).toBe(403)
  });
});
