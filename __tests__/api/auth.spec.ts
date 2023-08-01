import request from "supertest";
import server from "../../src/server/index";
import { configDotenv } from "dotenv";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

const app = server.getServer();

describe("loginFunction", () => {
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  it("should return a token when valid credentials are provided", async () => {
    const signInRequest = {
      email: "lakinduhewa@gmail.com",
      password: "Test@1234",
    };

    const response = await request(app).post("/auth/login").send(signInRequest);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should return 401 when invalid credentials are provided", async () => {
    const signInRequest = {
      email: "invalid@example.com",
      password: "invalidpassword",
    };

    const response = await request(app).post("/auth/login").send(signInRequest);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "User does not exist"
    );
  });

  it("should return 401 when email is missing", async () => {
    const signInRequest = { password: "Test@1234" };

    const response = await request(app).post("/auth/login").send(signInRequest);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Missing email or password"
    );
  });

  it("should return 401 when password is missing", async () => {
    const signInRequest = { email: "lakinduhewa@gmail.com" };

    const response = await request(app).post("/auth/login").send(signInRequest);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Missing email or password"
    );
  });
});
