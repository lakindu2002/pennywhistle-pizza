import { Request, Response } from "express";
import { SignUpRequest } from "@pizza/dto";
import { UserRole } from "@pizza/entities";
import { UserService } from "@pizza/api/services";

export const createCustomerFunction = async (req: Request, resp: Response) => {
  const {
    email,
    fullName,
    password,
    role = UserRole.CUSTOMER,
  } = req.body as SignUpRequest;
  try {
    const userId = await UserService.createUser({
      email,
      fullName,
      password,
      role,
    });
    resp.json({ message: "ACCOUNT_CREATED", id: userId });
  } catch (err) {
    resp.status(400);
    resp.json({ message: err?.message || "Failed to create user" });
  }
};
export const createInternalUserFunction = async (
  req: Request,
  resp: Response
) => {
  const { email, fullName, password, role } = req.body as SignUpRequest;

  try {
    const userId = await UserService.createUser({
      email,
      fullName,
      password,
      role,
    });
    resp.json({ message: "ACCOUNT_CREATED", id: userId });
  } catch (err) {
    resp.status(400);
    resp.json({ message: err?.message || "Failed to create user" });
  }
};
export const getUsersPerRole = async (req: Request, resp: Response) => {
  const { role } = req.params;

  if (!role || role !== UserRole.CUSTOMER) {
    resp.status(400);
    resp.json({ message: "BAD_INPUTS_RECIEVED" });
  }

  const users = await UserService.getUsersByRole(role as UserRole);
  resp.json({ items: users });
};
