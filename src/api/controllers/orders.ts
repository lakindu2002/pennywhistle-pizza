import { CreateOrderDTO } from "@pizza/dto/order";
import { OrderService } from "@pizza/api/services";
import { OrderStatus, OrderType, User, UserRole } from "@pizza/entities";
import { Request, Response } from "express";

export const makeOrder = async (req: Request, resp: Response) => {
  const { id } = req.user as User;
  const orderData = req.body as CreateOrderDTO;
  try {
    const orderId = OrderService.createOrder(orderData, id);
    resp.json({ message: "HEALTHY", orderId });
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
  }

  try {
    const currentOrders = OrderService.getCurrentOrdersPerCustomer(customerId);
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
  } else if (role === UserRole.KITCHEN_STAFF) {
    const [pendingOrders, preparingOrders] = await Promise.all([
      OrderService.getOrdersPerStatus(OrderStatus.PENDING),
      OrderService.getOrdersPerStatus(OrderStatus.PREPARING),
    ]);
    resp.json({ pendingOrders, preparingOrders });
  } else if (role === UserRole.DELIVERY_STAFF) {
    const orders = await OrderService.getOrdersPerStatus(
      OrderStatus.READY_TO_DELIVER
    );
    resp.json({ orders });
  } else if (role === UserRole.ADMINISTRATOR) {
    const { orders } = await OrderService.getAllOrders();
    resp.json({ orders });
  }
  resp.status(400);
  resp.json({ message: "BAD_REQUEST" });
};

export const getOrdersBetweenADateRange = async (
  req: Request,
  resp: Response
) => {
  resp.json({ message: "HEALTHY" });
};

export const updateOrderInformation = async (req: Request, resp: Response) => {
  const { role } = req.user as User;
  const { orderId } = req.params;
  const { type, status } = req.body as { type: OrderType; status: OrderStatus };

  try {
    if (role === UserRole.ADMINISTRATOR) {
      if (
        status === OrderStatus.PICKED_UP ||
        status === OrderStatus.DELIVERED
      ) {
        await OrderService.updateOrderStatus(
          orderId,
          OrderStatus.COMPLETED,
          status
        );
      }
    } else if (role === UserRole.STORE_STAFF) {
      // Store Staff can view and change order status only from Pending to Cancel
      if (status === OrderStatus.PENDING) {
        // Store staff can change the order status to Cancel
        await OrderService.updateOrderStatus(
          orderId,
          OrderStatus.CANCEL,
          status
        );
        resp.json({ message: "Order status updated to Cancel." });
      } else if (status === OrderStatus.READY_TO_PICK_UP) {
        await OrderService.updateOrderStatus(
          orderId,
          OrderStatus.PICKED_UP,
          status
        );
        resp.json({ message: "Order status updated to Cancel." });
      } else {
        resp
          .status(403)
          .json({ error: "Not authorized to update order status." });
      }
    } else if (role === UserRole.KITCHEN_STAFF) {
      // Kitchen Staff can pick up orders and change the status from Pending to Preparing
      if (status === OrderStatus.PENDING) {
        await OrderService.updateOrderStatus(
          orderId,
          OrderStatus.PREPARING,
          status
        );
        resp.json({ message: "Order status updated to Preparing." });
      } else if (status === OrderStatus.PREPARING) {
        await OrderService.updateOrderStatus(
          orderId,
          type === OrderType.DELIVERY
            ? OrderStatus.READY_TO_DELIVER
            : OrderStatus.READY_TO_PICK_UP,
          status
        );
      } else {
        resp.status(403).json({
          error: "Not authorized to update order status to Preparing.",
        });
      }
    } else if (role === UserRole.DELIVERY_STAFF) {
      // Delivery Staff can view orders that are ready to be delivered
      if (status === OrderStatus.READY_TO_DELIVER) {
        await OrderService.updateOrderStatus(
          orderId,
          OrderStatus.DELIVERED,
          status
        );
      } else {
        resp.status(403).json({
          error: "Not authorized to update order status to Delivered.",
        });
      }
    } else {
      resp.status(403).json({ error: "Unauthorized role." });
    }
  } catch (error) {
    resp.status(500).json({
      error: "Failed to update order information. Please try again later.",
    });
  }
};
