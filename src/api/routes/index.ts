import passport from "passport";
import { Router } from "express";
import * as healthController from "@pizza/api/controllers/health";
import * as authController from "@pizza/api/controllers/auth";
import * as userController from "@pizza/api/controllers/users";
import * as productsController from "@pizza/api/controllers/products";
import * as orderController from "@pizza/api/controllers/orders";
import * as welcomeController from "@pizza/api/controllers/welcome";
import { Authorizer } from "@pizza/utils";

const routes = Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Welcome
 *     summary: Get a welcome message.
 *     description: Returns a welcome message for the Pennywhistle Pizza Web API.
 *     responses:
 *       200:
 *         description: OK. The welcome message is sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The welcome message.
 *                   example: WELCOME TO PENNYWHISTLE PIZZA WEB API. VISIT API DOCUMENTATION AT /docs
 */
routes.get("/", welcomeController.sendWelcome);

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *     - Health
 *     summary: Get the health status of the application.
 *     description: Retrieve the health status of the application.
 *     responses:
 *       200:
 *         description: OK. The application is healthy.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
routes.get("/health", healthController.processHealthRequest);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *     - Users
 *     security:
 *     - bearerAuth: []
 *     summary: Create a new customer account.
 *     description: Create a new customer account with the given details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       200:
 *         description: OK. The customer account is created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: ACCOUNT_CREATED
 *                 id:
 *                   type: string
 *                   description: The ID of the newly created user.
 *                   example: 1234567890
 *       400:
 *         description: Failed to create user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Email already exists.
 */
routes.post(
  "/users",
  Authorizer.checkRoleAuthorization,
  userController.createCustomerFunction
);

/**
 * @swagger
 * /users/internal:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *     - Users
 *     summary: Create a new internal user account.
 *     description: Create a new internal user account with the given details. Requires JWT authentication and role authorization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       200:
 *         description: OK. The internal user account is created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: ACCOUNT_CREATED
 *                 id:
 *                   type: string
 *                   description: The ID of the newly created user.
 *                   example: 1234567890
 *       400:
 *         description: Bad Request. Failed to create the user account.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Invalid request.
 *       403:
 *         description: Forbidden. User does not have the required role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Insufficient permissions.
 */
routes.post(
  "/users/internal",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  userController.createInternalUserFunction
);

/**
 * @swagger
 * /users/find/{role}:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *     - Users
 *     summary: Get users by role.
 *     description: Get users with the specified role.
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         description: The role of the users to retrieve.
 *         schema:
 *           type: string
 *         example: customer
 *     responses:
 *       200:
 *         description: OK. Users with the specified role retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   description: The list of users with the specified role.
 *                   items:
 *                    $ref: '#/components/schemas/SignUpRequest'
 *       400:
 *         description: Bad Request. Invalid role or no role provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: BAD_INPUTS_RECEIVED
 */
routes.post(
  "/users/find/:role",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  userController.getUsersPerRole
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *     - Auth
 *     summary: Authenticate user and generate a JWT token.
 *     description: Authenticate the user with the provided email and password and generate a JWT token on successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: OK. User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for authentication.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.OsXVi4klm1-UgA2P2IJNn4QD-9I9rLvcuDBg8yEGFL4
 *       401:
 *         description: Unauthorized. Invalid username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Invalid username or password.
 */
routes.post("/auth/login", authController.loginFunction);

/**
 * @swagger
 * /products:
 *     security:
 *     - bearerAuth: []
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a new product.
 *     description: Create a new product with the given details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreateRequest'
 *     responses:
 *       200:
 *         description: OK. The product is created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: PRODUCT_CREATED
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       409:
 *         description: Conflict. The product already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: The product already exists.
 */
routes.post(
  "/products",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.createProduct
);

/**
 * @swagger
 * /products/find:
 *     security:
 *     - bearerAuth: []
 *   post:
 *     tags:
 *       - Products
 *     summary: Get products with pagination.
 *     description: Get products with pagination using the provided `nextKey`.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nextKey:
 *                 type: object
 *                 description: The next key to retrieve the next set of products.
 *                 properties:
 *                   baseSku:
 *                     type: string
 *                     description: The base SKU of the product.
 *                     example: MARGERITA
 *                   variantSku:
 *                     type: string
 *                     description: The SKU of the variant product.
 *                     example: MARGERITA_SMALL
 *     responses:
 *       200:
 *         description: OK. Products retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   description: The list of products with variants.
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: The name of the product.
 *                         example: Product Name
 *                       baseSku:
 *                         type: string
 *                         description: The base SKU of the product.
 *                         example: MARGERITA
 *                       variants:
 *                         type: array
 *                         description: The list of product variants.
 *                         items:
 *                           type: object
 *                           properties:
 *                            price:
 *                              type: number
 *                              format: float
 *                              description: The price of the product variant.
 *                              example: 19.99
 *                            size:
 *                              $ref: '#/components/schemas/ProductSize'
 *                            type:
 *                              $ref: '#/components/schemas/ProductType'
 *                            baseSku:
 *                              type: string
 *                              description: The Base Stock Keeping Unit.
 *                              example: MARGERITA
 *                            variantSku:
 *                              type: string
 *                              description: The Base Stock + Size.
 *                              example: MARGERITA_SMALL
 *                 nextKey:
 *                   type: object
 *                   description: The next key for pagination (optional).
 *                   properties:
 *                     variantSku:
 *                       type: string
 *                       description: The Base Stock + Size.
 *                       example: MARGERITA_SMALL
 *                     baseSku:
 *                       type: string
 *                       description: The Base Stock Keeping Unit.
 *                       example: MARGERITA
 */
routes.post(
  "/products/find",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.getProducts
);

/**
 * @swagger
 * /products/update:
 *     security:
 *     - bearerAuth: []
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update product or variant attributes.
 *     description: Update attributes of a product or its variant using the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseSku:
 *                 type: string
 *                 description: The base SKU of the product.
 *                 example: MARGERITA
 *               isVariantUpdate:
 *                 type: boolean
 *                 description: A flag to indicate if it's a variant update or a product update.
 *                 example: false
 *               variantSku:
 *                 type: string
 *                 description: The SKU of the variant product.
 *                 example: MARGERITA_SMALL
 *               updatedAttributes:
 *                 type: object
 *                 description: The updated attributes for the product or variant.
 *                 example: { "name": "Updated Product", "price": 25.99 }
 *     responses:
 *       200:
 *         description: OK. Product or variant updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: Product | variant updated successfully.
 *       500:
 *         description: Internal Server Error. An error occurred while updating the product or variant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *                   example: An error occurred while updating the product.
 */
routes.patch(
  "/products/update",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.patchProductById
);

/**
 * @swagger
 * /products/delete:
 *     security:
 *     - bearerAuth: []
 *   post:
 *     tags:
 *       - Products
 *     summary: Delete a product by base SKU.
 *     description: Delete a product using its base SKU.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The Base SKU of the product to be deleted.
 *                 example: MARGERITA
 *     responses:
 *       200:
 *         description: OK. Product deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: PRODUCT_DELETED
 *       500:
 *         description: Internal Server Error. Failed to remove the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to remove product.
 */
routes.post(
  "/products/delete",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  productsController.deleteProductByBaseSku
);

/**
 * @swagger
 * /orders:
 *     security:
 *     - bearerAuth: []
 *   post:
 *     tags:
 *       - Orders
 *     summary: Make a new order.
 *     description: Create a new order with the given details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDTO'
 *     responses:
 *       200:
 *         description: OK. The order is created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: The ID of the newly created order.
 *                   example: ABC123
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: ORDER_CREATED
 *       403:
 *         description: Forbidden. User does not have the required role permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *                   example: Access forbidden. Insufficient role permissions.
 *       500:
 *         description: Internal Server Error. Failed to create the order.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to create order.
 */
routes.post(
  "/orders",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.makeOrder
);

/**
 * @swagger
 * /orders/customer/{customerId}:
 *     security:
 *     - bearerAuth: []
 *   post:
 *     tags:
 *       - Orders
 *     summary: Get orders for a specific customer.
 *     description: Retrieve orders for the specified customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: The ID of the customer to retrieve orders for.
 *         schema:
 *           type: string
 *         example: ABC123
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nextKey:
 *                 type: object
 *                 description: The next key for pagination.
 *                 properties:
 *                   customerId:
 *                     type: string
 *                     description: The ID of the customer for the next page.
 *                   orderId:
 *                     type: string
 *                     description: The ID of the last retrieved order for the next page.
 *                 example:
 *                   customerId: ABC123
 *                   orderId: ORD456
 *     responses:
 *       200:
 *         description: OK. Orders for the specified customer retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   description: The list of orders for the customer.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 nextKey:
 *                   type: object
 *                   description: The next key for pagination.
 *                   properties:
 *                     customerId:
 *                       type: string
 *                       description: The ID of the customer for the next page.
 *                       example: ABC123
 *                     orderId:
 *                       type: string
 *                       description: The ID of the last retrieved order for the next page.
 *                       example: ORD456
 *       403:
 *         description: Forbidden. User does not have the required role permissions or cannot access orders of another customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: CANNOT_ACCESS
 *       500:
 *         description: Internal Server Error. Failed to fetch orders per customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to fetch orders per customer.
 */
routes.post(
  "/orders/customer/:customerId",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersPerCustomer
);

/**
 * @swagger
 * /orders/customer/{customerId}/current:
 *   get:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Orders
 *     summary: Get the current order information for a specific customer.
 *     description: Retrieve the current order information for the specified customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         description: The ID of the customer to retrieve the current order for.
 *         schema:
 *           type: string
 *         example: ABC123
 *     responses:
 *       200:
 *         description: OK. Current order information for the specified customer retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentOrders:
 *                   type: array
 *                   description: The list of current orders for the customer.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       403:
 *         description: Forbidden. User does not have the required role permissions or cannot access orders of another customer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: CANNOT_ACCESS
 *       500:
 *         description: Internal Server Error. Failed to fetch current orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to fetch current orders.
 */
routes.get(
  "/orders/customer/:customerId/current",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getCustomersCurrentOrderInformation
);

/**
 * @swagger
 * /orders/status/{status}:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Orders
 *     summary: Get orders by status.
 *     description: Retrieve orders based on the specified status.
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         description: The status of the orders to retrieve.
 *         schema:
 *           type: string
 *         example: pending
 *     responses:
 *       200:
 *         description: OK. Orders by status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   description: The list of orders for the specified status.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request. Invalid role or no role provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: BAD_REQUEST
 *       403:
 *         description: Forbidden. User does not have the required role permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Insufficient permissions.
 *       500:
 *         description: Internal Server Error. Failed to fetch orders by status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to fetch orders by status.
 */
routes.post(
  "/orders/status/:status",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersByStatus
);

/**
 * @swagger
 * /orders/{orderId}:
 *   patch:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Orders
 *     summary: Update order information.
 *     description: Update the status and/or type of the specified order. Different roles have different permissions for updating orders.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: The ID of the order to update.
 *         schema:
 *           type: string
 *         example: ABC123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of the order
 *                 enum: [delivery, pick_up]
 *                 example: delivery
 *               status:
 *                 type: string
 *                 description: The status of the order
 *                 enum: [pending, preparing, ready_to_deliver, delivered, cancelled]
 *                 example: preparing
 *     responses:
 *       200:
 *         description: OK. Order information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The success message.
 *                   example: Order information updated successfully.
 *       403:
 *         description: Forbidden. User does not have the required role permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Unauthorized role.
 *       500:
 *         description: Internal Server Error. Failed to update order information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to update order information. Please try again later.
 */
routes.patch(
  "/orders/:orderId",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.updateOrderInformation
);

/**
 * @swagger
 * /orders/between/{startDate}/{endDate}:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     tags:
 *       - Orders
 *     summary: Get orders between a date range.
 *     description: Retrieve orders that fall within the specified date range.
 *     parameters:
 *       - in: path
 *         name: startDate
 *         required: true
 *         description: The start date of the date range in milliseconds since Epoch.
 *         schema:
 *           type: string
 *         example: 167784000000
 *       - in: path
 *         name: endDate
 *         required: true
 *         description: The end date of the date range in milliseconds since Epoch.
 *         schema:
 *           type: string
 *         example: 1679504399000
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The status of the orders to retrieve (optional).
 *                 enum: [pending, preparing, ready_to_deliver, delivered, cancelled]
 *                 example: pending
 *     responses:
 *       200:
 *         description: OK. Orders between the date range retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   description: The list of orders within the specified date range.
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request. Invalid inputs provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Invalid inputs.
 *       500:
 *         description: Internal Server Error. Failed to fetch orders between the date range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                   example: Failed to fetch orders between the date range.
 */
routes.post(
  "/orders/between/:startDate/:endDate",
  passport.authenticate("jwt", { session: false }),
  Authorizer.checkRoleAuthorization,
  orderController.getOrdersBetweenADateRange
);

export default routes;
