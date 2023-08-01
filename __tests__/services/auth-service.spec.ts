import { AuthService } from "../../src/api/services";
import { configDotenv } from "dotenv";
const { createTables } = require("../../dynamodb");
const { insertSampleData } = require("../../insert-sample-data");
const { cleanupTables } = require("../../clean-up-tables");

describe("AuthService", () => {
  beforeAll(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  it("should return a valid JWT token for a successful login", async () => {
    const token = await AuthService.login("lakindu@gmail.com", "Test@1234");

    expect(token.length).toBeGreaterThan(0);
  });

  it("should throw an error for a user that does not exist", async () => {
    const email = "invalid@example.com";
    const password = "wrong_password";

    // Expect the login function to throw an error
    await expect(AuthService.login(email, password)).rejects.toThrowError(
      "User does not exist"
    );
  });

  afterAll(async () => {
    await cleanupTables();
  });
});
