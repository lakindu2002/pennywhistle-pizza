import { UserRole, User } from "@pizza/entities";
import { createUserEntity } from "../../src/utils/user";

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
    expect(user.updatedAt).toBe(user.createdAt);
  });
});
