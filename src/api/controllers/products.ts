import { Request, Response } from "express";

export const createProduct = (req: Request, resp: Response) => {
  resp.json({ message: "Healthy" });
};

export const getProducts = (req: Request, resp: Response) => {
  resp.json({ message: "Healthy" });
};

export const patchProductById = (req: Request, resp: Response) => {
  resp.json({ message: "Healthy" });
};

export const deleteProductById = (req: Request, resp: Response) => {
  resp.json({ message: "Healthy" });
};
