import bcrypt from "bcrypt";

export class PasswordHasher {
  static SALT = 10;

  static hashPassword(password: string) {
    const hashedPassword = bcrypt.hashSync(password, this.SALT);
    return hashedPassword;
  }

  static areHashesSimilar(hashedPassword: string, password: string) {
    const result = bcrypt.compareSync(password, hashedPassword);
    return !!result;
  }
}
