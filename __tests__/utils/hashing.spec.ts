import { PasswordHasher } from "../../src/utils/hashing";

describe("PasswordHasher", () => {
  describe("hashPassword", () => {
    it("should hash the password using bcrypt hashSync", () => {
      const password = "testPassword";

      const hashedPassword = PasswordHasher.hashPassword(password);

      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe("areHashesSimilar", () => {
    it("should return true if the hashedPassword matches the original password", () => {
      const password = "testPassword";
      const hashedPassword = PasswordHasher.hashPassword(password);

      const result = PasswordHasher.areHashesSimilar(hashedPassword, password);

      expect(result).toBe(true);
    });

    it("should return false if the hashedPassword does not match the original password", () => {
      const password = "testPassword";
      const hashedPassword = PasswordHasher.hashPassword("123456");

      const result = PasswordHasher.areHashesSimilar(hashedPassword, password);

      expect(result).toBe(false);
    });
  });
});
