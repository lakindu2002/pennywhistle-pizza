import { UserRole } from "@pizza/entities";

export interface SignUpRequest {
  fullName: string;
  email: string;
  /**
   * @default UserRole.CUSTOMER
   */
  role?: UserRole;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}
