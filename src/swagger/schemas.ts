/**
 * @swagger
 * components:
 *   schemas:
 *     SignUpRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user.
 *           example: user@example.com
 *         fullName:
 *           type: string
 *           description: The full name of the user.
 *           example: John Doe
 *         password:
 *           type: string
 *           description: The password of the user.
 *           example: password123
 *         role:
 *           type: string
 *           description: The role of the user (optional).
 *           enum:
 *             - customer
 *             - internal_administrator
 *             - internal_store_staff
 *             - internal_kitchen_staff
 *             - internal_delivery_staff
 *           example: customer
 *
 *     SignInRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user.
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: The password of the user.
 *           example: password123
 *
 *     HealthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The health status message.
 *           example: Healthy
 *
 *     UserByRoleResponse:
 *       type: object
 *       properties:
 *         id:
 *          type: string
 *          description: The ID of the user.
 *          example: 12345
 *         fullName:
 *          type: string
 *          description: The full name of the user.
 *          example: John Doe
 *         role:
 *          type: string
 *          description: The role of the user.
 *          enum:
 *            - customer
 *            - internal_administrator
 *            - internal_store_staff
 *            - internal_kitchen_staff
 *            - internal_delivery_staff
 *          example: customer
 *         createdAt:
 *          type: number
 *          description: Timestamp of when the user was created.
 *          example: 1667109864000
 *         updatedAt:
 *          type: number
 *          description: Timestamp of when the user was last updated.
 *          example: 1667109864000
 *
 *     ProductSize:
 *       type: string
 *       description: The size of the product.
 *       enum:
 *         - small
 *         - regular
 *         - large
 *       example: small
 *
 *     ProductType:
 *       type: string
 *       description: The type/category of the product.
 *       enum:
 *         - thin_crust
 *         - thick_crust
 *         - sasuage_crust
 *       example: thin_crust
 *
 *     ProductVariantDTO:
 *       type: object
 *       properties:
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product variant.
 *           example: 19.99
 *         size:
 *           $ref: '#/components/schemas/ProductSize'
 *         type:
 *           $ref: '#/components/schemas/ProductType'
 *
 *     ProductCreateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the product.
 *           example: My Product
 *         sku:
 *           type: string
 *           description: The SKU (Stock Keeping Unit) of the product.
 *           example: MARGERITA
 *         variants:
 *           type: array
 *           description: An array of product variants.
 *           items:
 *             $ref: '#/components/schemas/ProductVariantDTO'
 *       required:
 *         - name
 *         - sku
 *         - variants
 *       example:
 *         name: My Product
 *         sku: MARGERITA
 *         variants:
 *           - price: 19.99
 *             size: small
 *             type: thin_crust
 *           - price: 24.99
 *             size: regular
 *             type: thin_crust
 *           - price: 29.99
 *             size: large
 *             type: thick_crust
 *
 *     CreateOrderDTO:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           description: The list of order items.
 *           items:
 *             $ref: '#/components/schemas/OrderItemDTO'
 *         type:
 *           type: string
 *           description: The type of the order.
 *           enum:
 *             - pickup
 *             - delivery
 *           example: pickup
 *         deliveryInformation:
 *           $ref: '#/components/schemas/DeliveryInformation'
 *       example:
 *         items:
 *           - baseSku: MARGERITA
 *             variantSku: MARGERITA_SMALL
 *             quantity: 2
 *         type: pickup
 *         deliveryInformation:
 *           addressLine1: 123 Main St
 *           postalCode: 12345
 *           city: Cityville
 *           country: Countryland
 *
 *     OrderItemDTO:
 *       type: object
 *       properties:
 *         baseSku:
 *           type: string
 *           description: The base SKU of the product.
 *           example: MARGERITA
 *         variantSku:
 *           type: string
 *           description: The variant SKU of the product.
 *           example: MARGERITA_SMALL
 *         quantity:
 *           type: number
 *           description: The quantity of the product in the order.
 *           example: 2
 *
 *     DeliveryInformation:
 *       type: object
 *       properties:
 *         addressLine1:
 *           type: string
 *           description: The address line 1 for delivery.
 *           example: 123 Main St
 *         addressLine2:
 *           type: string
 *           description: The address line 2 for delivery (optional).
 *           example: Apartment 4B
 *         postalCode:
 *           type: string
 *           description: The postal code for delivery.
 *           example: 12345
 *         city:
 *           type: string
 *           description: The city for delivery.
 *           example: Cityville
 *         country:
 *           type: string
 *           description: The country for delivery.
 *           example: Countryland
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         baseSku:
 *           type: string
 *           description: The base SKU of the product.
 *           example: MARGERITA
 *         variantSku:
 *           type: string
 *           description: The variant SKU of the product.
 *           example: MARGERITA_SMALL
 *         quantity:
 *           type: number
 *           description: The quantity of the product in the order.
 *           example: 2
 *         price:
 *           type: number
 *           format: float
 *           description: The price of the product in the order.
 *           example: 19.99
 *
 *     Order:
 *       type: object
 *       properties:
 *         orderId:
 *           type: string
 *           description: The ID of the order.
 *           example: 123456789
 *         createdAt:
 *           type: number
 *           description: Timestamp of when the order was created.
 *           example: 1667109864000
 *         updatedAt:
 *           type: number
 *           description: Timestamp of when the order was last updated.
 *           example: 1667109864000
 *         status:
 *           type: string
 *           description: The status of the order.
 *           enum:
 *             - pending
 *             - cancel
 *             - preparing
 *             - ready_to_pick_up
 *             - ready_to_deliver
 *             - delivered
 *             - picked_up
 *             - completed
 *           example: pending
 *         customerId:
 *           type: string
 *           description: The ID of the customer who placed the order.
 *           example: 56789
 *         items:
 *           type: array
 *           description: The list of order items.
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         type:
 *           type: string
 *           description: The type of the order.
 *           enum:
 *             - pickup
 *             - delivery
 *           example: pickup
 *         deliveryInformation:
 *           $ref: '#/components/schemas/DeliveryInformation'
 *           example:
 *             addressLine1: 123 Main St
 *             postalCode: 12345
 *             city: Cityville
 *             country: Countryland
 *
 *     OrderStatus:
 *       type: string
 *       description: The status of the order.
 *       enum:
 *         - pending
 *         - cancel
 *         - preparing
 *         - ready_to_pick_up
 *         - ready_to_deliver
 *         - delivered
 *         - picked_up
 *         - completed
 *       example: pending
 *
 *     OrderType:
 *       type: string
 *       description: The type of the order.
 *       enum:
 *         - pickup
 *         - delivery
 *       example: pickup
 *
 *     UserRole:
 *       type: string
 *       description: The role of the user.
 *       enum:
 *         - customer
 *         - internal_administrator
 *         - internal_store_staff
 *         - internal_kitchen_staff
 *         - internal_delivery_staff
 *       example: customer
 *
 *     HealthCheckResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The status of the health check.
 *           example: "OK"
 *         message:
 *           type: string
 *           description: The message from the health check.
 *           example: "Service is up and running."
 *       required:
 *         - status
 *         - message
 *
 */
