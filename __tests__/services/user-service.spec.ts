import { configDotenv } from "dotenv";
import { UserService } from "../../src/api/services/user-service";
import { UserRole } from "../../src/entities";
const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

describe("UserService", () => {
  beforeEach(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterEach(async () => {
    await cleanupTables();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const signUpRequest = {
        fullName: "John Doe",
        role: UserRole.CUSTOMER,
        email: "abc@example.com",
        password: "securepassword",
      };

      const userId = await UserService.createUser(signUpRequest);

      expect(typeof userId).toBe("string");
    });

    it("should throw an error if the signUpRequest is missing required fields", async () => {
      const invalidSignUpRequest = {};

      await expect(
        UserService.createUser(invalidSignUpRequest as any)
      ).rejects.toThrowError("One or more required fields are missing");
    });

    it("should throw an error if the user already exists", async () => {
      const existingUserEmail = "lakindu@gmail.com";

      await expect(
        UserService.createUser({
          email: existingUserEmail,
          fullName: "John Doe",
          role: UserRole.CUSTOMER,
          password: "securepassword",
        } as any)
      ).rejects.toThrowError("The user exists with same email");
    });
  });

  describe("getUsersByRole", () => {
    it("should get users by role", async () => {
      const role = UserRole.CUSTOMER;

      const users = await UserService.getUsersByRole(role);

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it("should return an empty array if no users are found for the given role", async () => {
      const nonExistingRole = "nonexistingrole";

      const users = await UserService.getUsersByRole(
        nonExistingRole as UserRole
      );

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBe(0);
    });
  });

  describe("getUserByEmail", () => {
    it("should get a user by email", async () => {
      const userEmail = "lakindu@gmail.com";

      const user = await UserService.getUserByEmail(userEmail);

      expect(user).toBeDefined();
      expect(user.email).toBe(userEmail);
    });

    it("should throw an error if the user does not exist", async () => {
      const nonExistingEmail = "nonexisting@example.com";

      await expect(
        UserService.getUserByEmail(nonExistingEmail)
      ).rejects.toThrowError("User does not exist");
    });
  });

  describe("getUserById", () => {
    it("should return undefined if the user is not found", async () => {
      const nonExistingUserId = "nonexistinguserid";

      const user = await UserService.getUserById(nonExistingUserId);

      expect(user).toBeUndefined();
    });
  });
});
