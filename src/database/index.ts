import AWS from "aws-sdk";

class Database {
  db: AWS.DynamoDB.DocumentClient;
  userTable: string;
  constructor() {
    this.db = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
    });

    this.userTable = process.env.AWS_USER_TABLE_NAME;
  }

  // Add other methods for database operations here
}

export default Database;
