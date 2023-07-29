import { Router } from "express";
import * as healthController from "@pizza/api/controllers/health";

const routes = Router();

routes.get("/health", healthController.processHealthRequest);

export default routes;
