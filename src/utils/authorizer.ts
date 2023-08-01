import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "@pizza/entities";

const routes: { [key: string]: (UserRole | undefined)[] } = {
  "/users/find/:role": [UserRole.ADMINISTRATOR],
  "/users/internal": [UserRole.ADMINISTRATOR],
  "/users": [undefined, UserRole.ADMINISTRATOR, UserRole.STORE_STAFF],
  "/products": [UserRole.ADMINISTRATOR],
  "/products/find": [UserRole.ADMINISTRATOR, UserRole.CUSTOMER],
  "/products/update": [UserRole.ADMINISTRATOR],
  "/products/delete": [UserRole.ADMINISTRATOR],
  "/orders": [UserRole.CUSTOMER],
  "/orders/customer/:customerId": [UserRole.CUSTOMER, UserRole.ADMINISTRATOR],
  "/orders/customer/:customerId/current": [UserRole.CUSTOMER],
  "/orders/status/:status": [
    UserRole.ADMINISTRATOR,
    UserRole.DELIVERY_STAFF,
    UserRole.KITCHEN_STAFF,
    UserRole.STORE_STAFF,
  ],
  "/orders/between/:startDate/:endDate": [UserRole.ADMINISTRATOR],
  "/orders/:orderId": [
    UserRole.ADMINISTRATOR,
    UserRole.DELIVERY_STAFF,
    UserRole.KITCHEN_STAFF,
    UserRole.STORE_STAFF,
  ],
};

export class Authorizer {
  // Custom middleware function for role-based authorization

  static isAuthorized(userRole: UserRole, route: string) {
    const permissionsRequiredForPath = routes[route];
    if (!permissionsRequiredForPath) {
      return false;
    }
    if (permissionsRequiredForPath.includes(userRole)) {
      return true;
    }
    return false;
  }

  static checkRoleAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const userRole = (req.user as User | undefined)?.role;
    const path = req.route.path as string;

    if (Authorizer.isAuthorized(userRole, path)) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "Access forbidden. Insufficient role permissions." });
    }
  }
}
