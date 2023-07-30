import passport from "passport";
import { Router } from "express";
import * as healthController from "@pizza/api/controllers/health";
import * as authController from "@pizza/api/controllers/auth";
import * as userController from "@pizza/api/controllers/users";
import * as productsController from "@pizza/api/controllers/products";
import * as orderController from "@pizza/api/controllers/orders";
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

routes.post(
  "/products",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.createProduct
);
routes.post(
  "/products/find",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.getProducts
);
routes.patch(
  "/products/update",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.patchProductById
);
routes.post(
  "/products/delete",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.deleteProductByBaseSku
);

routes.post(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.makeOrder
);

routes.post(
  "/orders/customer/:customerId",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersPerCustomer
);

routes.get(
  "/orders/customer/:customerId/current",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getCustomersCurrentOrderInformation
);

routes.post(
  "/orders/status/:status",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersByStatus
);

routes.patch(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.updateOrderInformation
);

routes.post(
  "/orders/between/:startDate/:endDate",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersBetweenADateRange
);

export default routes;
