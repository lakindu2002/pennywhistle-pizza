import { ProductSchema } from "./product";

export enum OrderStatus {
  PENDING = "pending",
  CANCEL = "cancel",
  PREPARING = "preparing",
  READY_TO_PICK_UP = "ready_to_pick_up",
  READY_TO_DELIVER = "ready_to_deliver",
  DELIVERED = "delivered",
  PICKED_UP = "picked_up",
  COMPLETED = "completed",
}

export enum OrderType {
  PICK_UP = "pickup",
  DELIVERY = "delivery",
}

export interface DeliveryInformation {
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface OrderItem extends ProductSchema {
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: OrderStatus;
  customerId: string;
  items: Array<OrderItem>;
  type: OrderType;
  /**
   * only mandatory if type === OrderType.PICK_UP
   */
  deliveryInformation?: DeliveryInformation;
}
