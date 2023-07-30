export enum UserRole {
  CUSTOMER = "customer",
  ADMINISTRATOR = "internal_administrator",
  STORE_STAFF = "internal_store_staff",
  KITCHEN_STAFF = "internal_kitchen_staff",
  DELIVERY_STAFF = "internal_delivery_staff",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
  password: string;
}
