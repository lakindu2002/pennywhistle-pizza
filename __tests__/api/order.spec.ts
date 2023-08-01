import request from "supertest";
import server from "../../src/server/index";
import { configDotenv } from "dotenv";
import { CreateOrderDTO } from "../../src/dto";
import { OrderStatus, OrderType } from "../../src/entities";
import { AuthService } from "../../src/api/services";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

const app = server.getServer();

describe("POST /orders", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should create an order when valid data is provided", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const mockOrderData: CreateOrderDTO = {
      items: [
        {
          quantity: 30,
          baseSku: "MARGERITA_PIZZA",
          variantSku: "MARGERITA_PIZZA_SMALL",
        } as any,
      ],
      type: OrderType.PICK_UP,
    };

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${customerUserToken}`)
      .send(mockOrderData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("orderId");
    expect(response.body).toHaveProperty("message", "ORDER_CREATED");
  });

  it("should not create an order when valid data is provided for delivery without delivery information", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const mockOrderData: CreateOrderDTO = {
      items: [
        {
          quantity: 30,
          baseSku: "MARGERITA_PIZZA",
          variantSku: "MARGERITA_PIZZA_SMALL",
        } as any,
      ],
      type: OrderType.DELIVERY,
    };

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${customerUserToken}`)
      .send(mockOrderData);

    expect(response.body).toHaveProperty(
      "message",
      "Delivery information must be provided"
    );
  });

  it("should create an order when valid data is provided for delivery", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const mockOrderData: CreateOrderDTO = {
      items: [
        {
          quantity: 30,
          baseSku: "MARGERITA_PIZZA",
          variantSku: "MARGERITA_PIZZA_SMALL",
        } as any,
      ],
      type: OrderType.DELIVERY,
      deliveryInformation: {
        addressLine1: "Address 1",
        addressLine2: "Address 2",
        postalCode: "10115",
        city: "Malabe",
        country: "Country",
      },
    };

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${customerUserToken}`)
      .send(mockOrderData);

    expect(response.body).toHaveProperty("message", "ORDER_CREATED");
  });

  it("should return an error when order creation fails", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );

    const mockOrderData = {};

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${customerUserToken}`)
      .send(mockOrderData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "PAYLOAD_REQUIRED");
  });

  it("should not let user create order with no auth", async () => {
    const mockOrderData = {};

    const response = await request(app).post("/orders").send(mockOrderData);

    expect(response.status).toBe(401);
  });
});

describe("POST /orders/customer/:customerId", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should not let a customer check another users order", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const userId = "b0968154-3762-48d2-9096-1239bda82928";
    const response = await request(app)
      .post(`/orders/customer/${userId}`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(403);
  });

  it("should let a customer check their orders correctly", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const userId = "b0968154-3762-48d2-9096-1239bda82908"; // taken from insert-sample-data.js script.
    const response = await request(app)
      .post(`/orders/customer/${userId}`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(200);
  });

  it("should let admins check orders per customer", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const userId = "b0968154-3762-48d2-9096-1239bda82908"; // taken from insert-sample-data.js script.
    const response = await request(app)
      .post(`/orders/customer/${userId}`)
      .set("Authorization", `Bearer ${adminUserToken}`);

    expect(response.status).toBe(200);
  });
});

describe("GET /orders/customer/:customerId/current", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });
  it("should not let a customer check another users current order", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const userId = "b0968154-3762-48d2-9096-1239bda82808";
    const response = await request(app)
      .get(`/orders/customer/${userId}/current`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(403);
  });

  it("should let a customer check their current order", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const userId = "b0968154-3762-48d2-9096-1239bda82908"; // taken from insert-sample-data.js script.
    const response = await request(app)
      .get(`/orders/customer/${userId}/current`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(200);
  });
});

describe("POST /orders/status/:status", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });
  it("should not let customers check orders per status", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/status/${OrderStatus.CANCEL}`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(403);
  });
});

describe("PATCH /orders/:orderId", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });
  it("should not let customers patch orders per ID", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .patch("/orders/1")
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(403);
  });
});

describe("POST /orders/between/:startDate/:endDate", () => {
  beforeAll(async () => {
    configDotenv();
    server.configureAuthMiddleware();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });
  it("should not let customers view orders per date range", async () => {
    const customerUserToken = await AuthService.login(
      "lakindu@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/between/${Date.now()}/${Date.now()}`)
      .set("Authorization", `Bearer ${customerUserToken}`);

    expect(response.status).toBe(403);
  });
  it("should let admins view orders per date range", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/between/${Date.now()}/${Date.now()}`)
      .set("Authorization", `Bearer ${adminUserToken}`);
    expect(response.status).toBe(200);
  });
  it("should let administrator view orders per date range and pending status", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/between/${Date.now()}/${Date.now()}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({
        status: OrderStatus.PENDING,
      });
    expect(response.status).toBe(200);
  });
  it("should let administrator view orders per date range and cancelled status", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/between/${Date.now()}/${Date.now()}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({
        status: OrderStatus.CANCEL,
      });
    expect(response.status).toBe(200);
  });
  it("should let administrator view orders per date range and status thats invalid", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/orders/between/${Date.now()}/${Date.now()}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({
        status: OrderStatus.DELIVERED,
      });
    expect(response.body.message).toBe("Status can only be Cancel or Pending");
  });
});
