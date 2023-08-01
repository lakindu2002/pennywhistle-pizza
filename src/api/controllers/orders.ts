import { CreateOrderDTO } from "@pizza/dto/order";
import { OrderService } from "@pizza/api/services";
import { OrderStatus, OrderType, User, UserRole } from "@pizza/entities";
import { Request, Response } from "express";
import {
  handleAdministratorUpdate,
  handleDeliveryStaffUpdate,
  handleKitchenStaffUpdate,
  handleStoreStaffUpdate,
} from "@pizza/utils";

export const makeOrder = async (req: Request, resp: Response) => {
  const { id } = req.user as User;
  const orderData = req.body as CreateOrderDTO;
  try {
    const orderId = await OrderService.createOrder(orderData, id);
    resp.json({ orderId, message: "ORDER_CREATED" });
  } catch (err) {
    resp.status(500);
    resp.json({ message: "Failed to create order" });
  }
};

export const getOrdersPerCustomer = async (req: Request, resp: Response) => {
  const { id, role } = req.user as User;
  const { customerId } = req.params;

  if (role === UserRole.CUSTOMER && customerId !== id) {
    resp.status(403);
    resp.json({ message: "CANNOT_ACCESS" });
    return;
  }

  try {
    const { nextKey } = req.body;
    const { orders, nextKey: newNextKey } =
      await OrderService.getOrdersPerCustomerId(customerId, nextKey);
    resp.json({ orders, nextKey: newNextKey });
  } catch (err) {
    resp.status(500);
    resp.json({ message: "Failed to fetch orders per customer" });
  }
};

export const getCustomersCurrentOrderInformation = async (
  req: Request,
  resp: Response
) => {
  const { id } = req.user as User;
  const { customerId } = req.params;

  if (customerId !== id) {
    resp.status(403);
    resp.json({ message: "CANNOT_ACCESS" });
    return;
  }

  try {
    const currentOrders = await OrderService.getCurrentOrdersPerCustomer(
      customerId
    );
    resp.json({ currentOrders });
  } catch (err) {
    resp.status(500);
    resp.json({ message: "Failed to fetch current orders" });
  }
};

export const getOrdersByStatus = async (req: Request, resp: Response) => {
  const { role } = req.user as User;
  if (role === UserRole.STORE_STAFF) {
    // can view all pending orders
    const { orders } = await OrderService.getOrdersPerStatus(
      OrderStatus.PENDING
    );
    resp.json({ orders });
    return;
  }
  if (role === UserRole.KITCHEN_STAFF) {
    const [pendingOrders, preparingOrders] = await Promise.all([
      OrderService.getOrdersPerStatus(OrderStatus.PENDING),
      OrderService.getOrdersPerStatus(OrderStatus.PREPARING),
    ]);
    resp.json({ pendingOrders, preparingOrders });
    return;
  }
  if (role === UserRole.DELIVERY_STAFF) {
    const orders = await OrderService.getOrdersPerStatus(
      OrderStatus.READY_TO_DELIVER
    );
    resp.json({ orders });
    return;
  }
  if (role === UserRole.ADMINISTRATOR) {
    const { orders } = await OrderService.getAllOrders();
    resp.json({ orders });
    return;
  }
  resp.status(400);
  resp.json({ message: "BAD_REQUEST" });
};

export const getOrdersBetweenADateRange = async (
  req: Request,
  resp: Response
) => {
  const { startDate, endDate } = req.params;
  const { status } = req.body as { status?: OrderStatus };

  if (!startDate || !endDate || !Number(startDate) || !Number(endDate)) {
    resp.status(400);
    resp.json({ message: "Invalid inputs" });
    return;
  }

  try {
    const ordersPerDateAndStatus = await OrderService.ordersPerDateAndStatus(
      Number(startDate),
      Number(endDate),
      status
    );
    resp.json({ orders: ordersPerDateAndStatus });
  } catch (err) {
    resp.status(500);
    resp.json({ message: "Failed to fetch order" });
  }
};

export const updateOrderInformation = async (req: Request, resp: Response) => {
  const { role } = req.user as User;
  const { orderId } = req.params;
  const { type, status } = req.body as { type: OrderType; status: OrderStatus };

  try {
    if (role === UserRole.ADMINISTRATOR) {
      await handleAdministratorUpdate(resp, orderId, status);
      return;
    }
    if (role === UserRole.STORE_STAFF) {
      await handleStoreStaffUpdate(resp, orderId, status);
      return;
    }
    if (role === UserRole.KITCHEN_STAFF) {
      await handleKitchenStaffUpdate(resp, orderId, status, type);
      return;
    }
    if (role === UserRole.DELIVERY_STAFF) {
      await handleDeliveryStaffUpdate(resp, orderId, status);
      return;
    }
    resp.status(403).json({ message: "Unauthorized role." });
  } catch (error) {
    resp.status(500).json({
      message: "Failed to update order information. Please try again later.",
    });
  }
};
