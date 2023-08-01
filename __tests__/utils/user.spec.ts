import { UserRole, User } from "@pizza/entities";
import { PasswordHasher } from "../../src/utils/hashing";
import { createUserEntity } from "../../src/utils/user";

jest.mock("../../src/utils/hashing", () => ({
  PasswordHasher: {
    hashPassword: jest.fn((password) => `hashed_${password}`),
  },
}));

describe("createUserEntity", () => {
  const userId = "12345";
  const name = "John Doe";
  const role: UserRole = UserRole.ADMINISTRATOR;
  const email = "john.doe@example.com";
  const password = "password123";

  it("should create a user entity with hashed password", () => {
    const user: User = createUserEntity(userId, name, role, email, password);

    expect(user.id).toBe(userId);
    expect(user.fullName).toBe(name);
    expect(user.role).toBe(role);
    expect(user.email).toBe(email);
    expect(user.password).toBe("hashed_password123");
    expect(user.createdAt).toBeLessThanOrEqual(Date.now());
    expect(user.updatedAt).toBeLessThanOrEqual(Date.now());
    expect(user.updatedAt).toBe(user.createdAt);
  });

  it("should call PasswordHasher.hashPassword with the provided password", () => {
    createUserEntity(userId, name, role, email, password);

    expect(PasswordHasher.hashPassword).toHaveBeenCalledWith(password);
  });
});
