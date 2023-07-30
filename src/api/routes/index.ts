import passport from "passport";
import { Router } from "express";
import * as healthController from "@pizza/api/controllers/health";
import * as authController from "@pizza/api/controllers/auth";
import * as userController from "@pizza/api/controllers/users";
import { Authorizer } from "@pizza/utils";

const routes = Router();

routes.get("/health", healthController.processHealthRequest);

routes.post(
  "/users",
  Authorizer.checkRoleAuthorization,
  userController.createCustomerFunction
);
routes.post(
  "/users/internal",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  userController.createInternalUserFunction
);
routes.post(
  "/users/find/:role",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  userController.getUsersPerRole
);

routes.post("/auth/login", authController.loginFunction);

export default routes;
