import { Response } from "express";
import { OrderService } from "@pizza/api/services";
import { OrderStatus, OrderType } from "@pizza/entities";

export const handleAdministratorUpdate = async (
  resp: Response,
  orderId: string,
  status: OrderStatus
) => {
  if (status === OrderStatus.PICKED_UP || status === OrderStatus.DELIVERED) {
    await OrderService.updateOrderStatus(
      orderId,
      OrderStatus.COMPLETED,
      status
    );
    resp.json({ message: "Order status updated to Completed." });
  } else {
    resp
      .status(403)
      .json({ message: "Not authorized to update order status." });
  }
};

export const handleStoreStaffUpdate = async (
  resp: Response,
  orderId: string,
  status: OrderStatus
) => {
  if (status === OrderStatus.PENDING) {
    await OrderService.updateOrderStatus(orderId, OrderStatus.CANCEL, status);
    resp.json({ message: "Order status updated to Cancel." });
  } else if (status === OrderStatus.READY_TO_PICK_UP) {
    await OrderService.updateOrderStatus(
      orderId,
      OrderStatus.PICKED_UP,
      status
    );
    resp.json({ message: "Order status updated to Picked Up." });
  } else {
    resp
      .status(403)
      .json({ message: "Not authorized to update order status." });
  }
};

export const handleKitchenStaffUpdate = async (
  resp: Response,
  orderId: string,
  status: OrderStatus,
  type: OrderType
) => {
  if (status === OrderStatus.PENDING) {
    await OrderService.updateOrderStatus(
      orderId,
      OrderStatus.PREPARING,
      status
    );
    resp.json({ message: "Order status updated to Preparing." });
  } else if (status === OrderStatus.PREPARING) {
    const newStatus =
      type === OrderType.DELIVERY
        ? OrderStatus.READY_TO_DELIVER
        : OrderStatus.READY_TO_PICK_UP;
    await OrderService.updateOrderStatus(orderId, newStatus, status);
    resp.json({ message: `Order status updated to ${newStatus}.` });
  } else {
    resp
      .status(403)
      .json({ message: "Not authorized to update order status." });
  }
};

export const handleDeliveryStaffUpdate = async (
  resp: Response,
  orderId: string,
  status: OrderStatus
) => {
  if (status === OrderStatus.READY_TO_DELIVER) {
    await OrderService.updateOrderStatus(
      orderId,
      OrderStatus.DELIVERED,
      status
    );
    resp.json({ message: "Order marked as delivered." });
  } else {
    resp
      .status(403)
      .json({ message: "Not authorized to update order status." });
  }
};
