import { Request, Response } from "express";

export const sendWelcome = (req: Request, resp: Response) => {
  resp.json({
    message:
      "WELCOME TO PENNYWHISTLE PIZZA WEB API. VISIT API DOCUMENTATION AT /docs",
  });
};
