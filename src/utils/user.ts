import { UserRole, User } from "@pizza/entities";
import { PasswordHasher } from "./hashing";

export const createUserEntity = (
  userId: string,
  name: string,
  role: UserRole,
  email: string,
  password: string
): User => {
  const timestamp = Date.now();
  const user: User = {
    id: userId,
    email,
    fullName: name,
    role,
    createdAt: timestamp,
    updatedAt: timestamp,
    password: PasswordHasher.hashPassword(password),
  };
  return user;
};
