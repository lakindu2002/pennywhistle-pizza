import { CreateOrderDTO } from "@pizza/dto/order";
import { Order, OrderItem, OrderStatus, OrderType } from "@pizza/entities";
import { generateNanoId } from "@pizza/utils";
import { ProductService } from "./product-service";
import Database from "@pizza/database";
import { startOfDay, endOfDay } from "date-fns";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

export class OrderService {
  static async ordersPerDateAndStatus(
    startDate: number,
    endDate: number,
    status?: OrderStatus
  ): Promise<Order[]> {
    const dayStart = startOfDay(startDate).getTime();
    const dayEnd = endOfDay(endDate).getTime();
    let nextKey: any;
    const orders: Order[] = [];

    const database = new Database();

    if (
      !!status && (status !== OrderStatus.CANCEL && status !== OrderStatus.PENDING)
    ) {
      throw new Error("Status can only be Cancel or Pending");
    }
    if (status) {
      do {
        const { Items = [], LastEvaluatedKey } = await database.db
          .query({
            TableName: database.ordersTable,
            IndexName: "status-createdAt-index",
            KeyConditionExpression:
              "#status = :status AND #createdAt BETWEEN :startDate AND :endDate",
            ExclusiveStartKey: nextKey,
            ExpressionAttributeNames: {
              "#status": "status",
              "#createdAt": "createdAt",
            },
            ExpressionAttributeValues: {
              ":status": status,
              ":startDate": dayStart,
              ":endDate": dayEnd,
            },
          })
          .promise();
        nextKey = LastEvaluatedKey;
        orders.push(...(Items as Order[]));
      } while (nextKey !== undefined);
    } else {
      do {
        const { Items = [], LastEvaluatedKey } = await database.db
          .scan({
            TableName: database.ordersTable,
            ExclusiveStartKey: nextKey,
            FilterExpression: "#createdAt BETWEEN :startDate AND :endDate",
            ExpressionAttributeNames: {
              "#createdAt": "createdAt",
            },
            ExpressionAttributeValues: {
              ":startDate": dayStart,
              ":endDate": dayEnd,
            },
          })
          .promise();
        nextKey = LastEvaluatedKey;
        orders.push(...(Items as Order[]));
      } while (nextKey !== undefined);
    }
    return orders;
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    prevStatus: OrderStatus
  ): Promise<boolean> {
    const database = new Database();
    await database.db
      .transactWrite({
        TransactItems: [
          {
            Update: {
              TableName: database.ordersTable,
              Key: { orderId },
              UpdateExpression: "SET #status = :newStatus",
              ConditionExpression: "#cstatus = :cstatus",
              ExpressionAttributeNames: {
                "#status": "status",
                "#cstatus": "status",
              },
              ExpressionAttributeValues: {
                ":cstatus": prevStatus,
                ":newStatus": newStatus,
              },
            },
          },
        ],
      })
      .promise();
    return true;
  }

  static async getOrderById(orderId: string): Promise<Order | undefined> {
    const database = new Database();
    const { Item } = await database.db
      .get({
        TableName: database.ordersTable,
        Key: { orderId },
      })
      .promise();

    return Item as Order | undefined;
  }

  static async getAllOrders() {
    const database = new Database();
    const { Items = [] } = await database.db
      .scan({
        TableName: database.ordersTable,
      })
      .promise();

    return { orders: Items as Order[] };
  }

  static async getOrdersPerStatus(status: OrderStatus): Promise<{
    orders: Order[];
  }> {
    const database = new Database();
    let nextKey: any;
    const orders: Order[] = [];
    do {
      const { Items = [], LastEvaluatedKey } = await database.db
        .query({
          TableName: database.ordersTable,
          IndexName: "status-index",
          KeyConditionExpression: "#status = :status",
          ExclusiveStartKey: nextKey,
          ExpressionAttributeNames: {
            "#status": "status",
          },
          ExpressionAttributeValues: {
            ":status": status,
          },
        })
        .promise();
      nextKey = LastEvaluatedKey;
      orders.push(...(Items as Order[]));
    } while (nextKey !== undefined);
    return { orders };
  }

  static async getOrdersPerCustomerId(
    customerId: string,
    nextKey?: any
  ): Promise<{
    orders: Order[];
    nextKey: DocumentClient.Key;
  }> {
    const database = new Database();
    const { Items = [], LastEvaluatedKey } = await database.db
      .query({
        TableName: database.ordersTable,
        IndexName: "customerId-index",
        KeyConditionExpression: "#customerId = :customerId",
        ExclusiveStartKey: nextKey,
        Limit: 15,
        ExpressionAttributeNames: {
          "#customerId": "customerId",
        },
        ExpressionAttributeValues: {
          ":customerId": customerId,
        },
      })
      .promise();
    return { orders: Items as Order[], nextKey: LastEvaluatedKey };
  }

  static async getCurrentOrdersPerCustomer(
    customerId: string
  ): Promise<Order[]> {
    const allOrders: Order[] = [];
    let orderNextKey: any;

    do {
      const { nextKey: newNextKey, orders: newOrders } =
        await OrderService.getOrdersPerCustomerId(customerId, orderNextKey);
      orderNextKey = newNextKey;
      allOrders.push(
        ...newOrders.filter(
          (order) =>
            order.status !== OrderStatus.COMPLETED &&
            order.status !== OrderStatus.CANCEL
        )
      );
    } while (orderNextKey !== undefined);

    return allOrders;
  }

  static async createOrder(
    orderDto: CreateOrderDTO,
    customerId: string
  ): Promise<string> {
    const { items, type, deliveryInformation } = orderDto;

    if (type === OrderType.DELIVERY && !deliveryInformation) {
      throw new Error("Delivery information must be provided");
    }

    const results = await Promise.all(
      items
        .map(async (item) => {
          const { baseSku, variantSku, quantity } = item;
          const resp = await ProductService.getProductBySKU(
            baseSku,
            variantSku
          );
          if (resp) {
            return {
              baseSku,
              variantSku,
              price: quantity * resp.price,
              quantity,
            } as OrderItem;
          }
          return undefined;
        })
        .filter((item) => !!item)
    );
    const timestamp = Date.now();
    const order: Order = {
      orderId: generateNanoId(),
      createdAt: timestamp,
      customerId,
      status: OrderStatus.PENDING,
      type,
      updatedAt: timestamp,
      deliveryInformation,
      items: results,
    };

    const database = new Database();
    await database.db
      .put({
        Item: order,
        TableName: database.ordersTable,
      })
      .promise();

    return order.orderId;
  }
}
