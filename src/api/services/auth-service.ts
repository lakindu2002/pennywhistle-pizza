import jwt from "jsonwebtoken";
import { PasswordHasher } from "@pizza/utils";
import { UserService } from "./user-service";

export class AuthService {
  static async login(email: string, password: string): Promise<string> {
    const user = await UserService.getUserByEmail(email);
    if (!PasswordHasher.areHashesSimilar(user.password, password)) {
      throw new Error("Invalid username or password");
    }
    // create jwt
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return token;
  }
}
