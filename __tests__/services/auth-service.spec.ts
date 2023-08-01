import { AuthService } from "../../src/api/services";
import { configDotenv } from "dotenv";
const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

describe("AuthService", () => {
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
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
});
