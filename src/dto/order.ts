import { DeliveryInformation, OrderType } from "@pizza/entities";
import { ProductSchema } from "@pizza/entities/product";

export interface CreateOrderDTO {
  items: Array<OrderItemDTO>;
  type: OrderType;
  deliveryInformation?: DeliveryInformation;
}

export interface OrderItemDTO extends ProductSchema {
  quantity: number;
}
