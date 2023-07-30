import AWS from "aws-sdk";

class Database {
  db: AWS.DynamoDB.DocumentClient;
  userTable: string;
  productsTable: string;
  constructor() {
    this.db = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
    });

    this.userTable = process.env.AWS_USER_TABLE_NAME;
    this.productsTable = process.env.AWS_PRODUCT_TABLE_NAME;
  }
}

export default Database;
