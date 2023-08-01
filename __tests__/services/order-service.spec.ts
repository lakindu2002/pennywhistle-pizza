import { configDotenv } from "dotenv";
import { OrderService } from "../../src/api/services";
import { CreateOrderDTO } from "../../src/dto";
import { OrderStatus, OrderType } from "../../src/entities";
import { endOfDecade, startOfDecade } from "date-fns";

const { insertSampleData } = require("../../scripts/insert-sample-data");
const { cleanupTables } = require("../../scripts/clean-up-tables");
const { createTables } = require("../../scripts/dynamodb");

describe("OrderService", () => {
  let orderId: string;

  beforeAll(async () => {
    configDotenv();
    await createTables();
    await insertSampleData();
  });

  afterAll(async () => {
    await cleanupTables();
  });

  it("should create a new order", async () => {
    const orderItems: any[] = [
      {
        baseSku: "MARGERITA_PIZZA",
        variantSku: "MARGERITA_PIZZA_SMALL",
        quantity: 2,
      },
    ];
    const orderDto: CreateOrderDTO = {
      items: orderItems,
      type: OrderType.DELIVERY,
      deliveryInformation: {
        addressLine1: "Address Line 1",
        addressLine2: "Address Line 2",
        postalCode: "10115",
        city: "Sample City",
        country: "ACMA Country",
      },
    };
    const customerId = "b0968154-3762-48d2-9096-1239bda82908";

    orderId = await OrderService.createOrder(orderDto, customerId);

    expect(orderId).toBeDefined();
  });

  it("should get an order by ID", async () => {
    const order = await OrderService.getOrderById(orderId);

    expect(order).toBeDefined();
    expect(order?.orderId).toBe(orderId);
    expect(order?.items.length).toBe(1);
  });

  it("should update the status of an order", async () => {
    const newStatus = OrderStatus.COMPLETED;
    const prevStatus = OrderStatus.PENDING;

    const result = await OrderService.updateOrderStatus(
      orderId,
      newStatus,
      prevStatus
    );

    expect(result).toBe(true);
    const updatedOrder = await OrderService.getOrderById(orderId);
    expect(updatedOrder?.status).toBe(newStatus);
  });

  it("should get orders per date and status", async () => {
    const startDate = startOfDecade(Date.now()).getTime();
    const endDate = endOfDecade(Date.now()).getTime();
    const status = OrderStatus.CANCEL;

    const orders = await OrderService.ordersPerDateAndStatus(
      startDate,
      endDate,
      status
    );

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThanOrEqual(0);
  });

  it("should get all orders", async () => {
    const { orders } = await OrderService.getAllOrders();

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThanOrEqual(0);
  });

  it("should get orders per status", async () => {
    const status = OrderStatus.COMPLETED;

    const { orders } = await OrderService.getOrdersPerStatus(status);

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThanOrEqual(0);
  });

  it("should get orders per customer ID", async () => {
    const customerId = "b0968154-3762-48d2-9096-1239bda82908";

    const { orders } = await OrderService.getOrdersPerCustomerId(customerId);

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThanOrEqual(0);
  });

  it("should get current orders per customer", async () => {
    const customerId = "b0968154-3762-48d2-9096-1239bda82908";

    const orders = await OrderService.getCurrentOrdersPerCustomer(customerId);

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThanOrEqual(0);
  });
});
