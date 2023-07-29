import { Request, Response } from "express";

export const processHealthRequest = (req: Request, resp: Response) => {
  resp.json({ message: "Healthy" });
};
