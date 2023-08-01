import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../src/utils/hashing";

jest.mock("bcryptjs", () => ({
  hashSync: jest.fn((password: string, salt: number) => `hashed_${password}`),
  compareSync: jest.fn((password: string, hashedPassword: string) =>
    hashedPassword.includes(`hashed_${password}`)
  ),
}));

describe("PasswordHasher", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("should hash the password using bcrypt hashSync", () => {
      const password = "testPassword";
      const expectedHashedPassword = "hashed_testPassword";

      const hashedPassword = PasswordHasher.hashPassword(password);

      expect(bcrypt.hashSync).toHaveBeenCalledWith(
        password,
        PasswordHasher.SALT
      );
      expect(hashedPassword).toBe(expectedHashedPassword);
    });
  });

  describe("areHashesSimilar", () => {
    it("should return true if the hashedPassword matches the original password", () => {
      const password = "testPassword";
      const hashedPassword = "hashed_testPassword";

      const result = PasswordHasher.areHashesSimilar(hashedPassword, password);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it("should return false if the hashedPassword does not match the original password", () => {
      const password = "testPassword";
      const hashedPassword = "hashed_differentPassword";

      const result = PasswordHasher.areHashesSimilar(hashedPassword, password);

      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
