import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "@pizza/entities";

const routes: { [key: string]: (UserRole | undefined)[] } = {
  "/users/find/:role": [UserRole.ADMINISTRATOR],
  "/users/internal": [UserRole.ADMINISTRATOR],
  "/users": [undefined, UserRole.ADMINISTRATOR, UserRole.STORE_STAFF],
};

export class Authorizer {
  // Custom middleware function for role-based authorization
  static checkRoleAuthorization(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Assuming the authenticated user's role is stored in req.user.role
    const userRole = (req.user as User | undefined)?.role;
    const path = req.route.path as string;

    const permissionsRequiredPerPath = routes[path];
    if (permissionsRequiredPerPath.includes(userRole)) {
      next();
    } else {
      res
        .status(403)
        .json({ error: "Access forbidden. Insufficient role permissions." });
    }
  }
}
