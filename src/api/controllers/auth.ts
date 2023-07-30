import { SignInRequest } from "@pizza/dto";
import { Request, Response } from "express";
import { AuthService } from "@pizza/api/services";

export const loginFunction = async (req: Request, resp: Response) => {
  const { email, password } = req.body as SignInRequest;
  try {
    const token = await AuthService.login(email, password);
    resp.json({ token });
  } catch (err) {
    resp.status(401);
    resp.send({ message: err?.message || "Invalid username or password" });
  }
};
