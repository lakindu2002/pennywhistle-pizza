import { Authorizer } from "../../src/utils";
import { UserRole } from "../../src/entities";

describe("Authorizer", () => {
  describe("isAuthorized", () => {
    it("should return true if userRole is included in the permissionsRequiredForPath", () => {
      const userRole = UserRole.ADMINISTRATOR;
      const path = "/users/find/:role";

      const result = Authorizer.isAuthorized(userRole, path);
      expect(result).toBe(true);
    });

    it("should return true if userRole is included in the array with undefined", () => {
      const userRole = UserRole.STORE_STAFF;
      const path = "/users";

      const result = Authorizer.isAuthorized(userRole, path);
      expect(result).toBe(true);
    });

    it("should return false if userRole is not included in the permissionsRequiredForPath", () => {
      const userRole = UserRole.CUSTOMER;
      const path = "/users/internal";

      const result = Authorizer.isAuthorized(userRole, path);
      expect(result).toBe(false);
    });

    it("should return false if route is not found in the routes object", () => {
      const userRole = UserRole.DELIVERY_STAFF;
      const path = "/nonexistent-route";

      const result = Authorizer.isAuthorized(userRole, path);
      expect(result).toBe(false);
    });

    it("should return false if permissionsRequiredForPath array is empty", () => {
      const userRole = UserRole.ADMINISTRATOR;
      const path = "/orders/customer/:customerId/current";

      const result = Authorizer.isAuthorized(userRole, path);
      expect(result).toBe(false);
    });
  });
});
