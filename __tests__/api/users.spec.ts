import request from "supertest";
import server from "../../src/server/index";
import { configDotenv } from "dotenv";
import { UserRole } from "../../src/entities";
import { AuthService } from "../../src/api/services";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

const app = server.getServer();

describe("createCustomerFunction", () => {
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  it("should create a customer when valid data is provided", async () => {
    const signUpRequest = {
      email: "customer@example.com",
      fullName: "John Doe",
      password: "password",
      role: UserRole.CUSTOMER,
    };

    const response = await request(app).post("/users").send(signUpRequest);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "ACCOUNT_CREATED");
    expect(response.body).toHaveProperty("id");
  });

  it("should return 400 when invalid role is provided", async () => {
    const signUpRequest = {
      email: "invalid@example.com",
      fullName: "Invalid User",
      password: "password",
      role: UserRole.ADMINISTRATOR,
    };

    const response = await request(app).post("/users").send(signUpRequest);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "BAD_REQUEST");
  });
});

describe("createInternalUserFunction", () => {
  beforeAll(() => {
    server.configureAuthMiddleware();
  });

  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  it("should create an internal user when valid data is provided", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const signUpRequest = {
      email: "internal1@example.com",
      fullName: "Internal User",
      password: "password",
      role: UserRole.STORE_STAFF,
    };
    const response = await request(app)
      .post("/users/internal")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(signUpRequest);
    console.log(response);

    expect(response.body).toHaveProperty("message", "ACCOUNT_CREATED");
    expect(response.body).toHaveProperty("id");
  });

  it("should return 400 when invalid role is provided", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const signUpRequest = {
      email: "invalid@example.com",
      fullName: "Invalid User",
      password: "password",
      role: UserRole.CUSTOMER, // internal user cannot be a customer.
    };

    const response = await request(app)
      .post("/users/internal")
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send(signUpRequest);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "BAD_REQUEST");
  });

  it("should return 403 when no auth provided", async () => {
    const signUpRequest = {
      email: "invalid@example.com",
      fullName: "Invalid User",
      password: "password",
      role: UserRole.CUSTOMER,
    };

    const response = await request(app)
      .post("/users/internal")
      .send(signUpRequest);
    expect(response.status).toBe(401);
  });
});

describe("getUsersPerRole", () => {
  beforeAll(() => {
    server.configureAuthMiddleware();
  });
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  it("should return users with the given role", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post(`/users/find/${UserRole.CUSTOMER}`)
      .set("Authorization", "Bearer " + adminUserToken);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it("should return 400 when invalid role is provided", async () => {
    const adminUserToken = await AuthService.login(
      "lakinduhewa@gmail.com",
      "Test@1234"
    );
    const response = await request(app)
      .post("/users/find/INVALID_ROLE")
      .set("Authorization", `Bearer ${adminUserToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "BAD_INPUTS_RECIEVED");
  });
});
