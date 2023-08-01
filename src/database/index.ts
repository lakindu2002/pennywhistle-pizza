import { Logger } from "@pizza/logger";
import AWS from "aws-sdk";

class Database {
  db: AWS.DynamoDB.DocumentClient;
  userTable: string;
  productsTable: string;
  ordersTable: string;

  constructor() {
    this.db = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
      ...(process.env.AWS_ACCESS &&
        process.env.AWS_SECRET_ACCESS && {
          accessKeyId: process.env.AWS_ACCESS,
          secretAccessKey: process.env.AWS_SECRET_ACCESS,
        }),
      ...(process.env.NODE_ENV === "test" && {
        endpoint: "http://localhost:8000",
      }),
    });

    this.userTable = process.env.AWS_USER_TABLE_NAME;
    this.productsTable = process.env.AWS_PRODUCT_TABLE_NAME;
    this.ordersTable = process.env.AWS_ORDER_TABLE_NAME;
  }
}

export default Database;
