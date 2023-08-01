const aws = require("aws-sdk");

aws.config.update({
  region: "ap-south-1",
  endpoint: "http://localhost:8000",
});

const dynamodb = new aws.DynamoDB({});

const createProductsTable = async () => {
  const params = {
    TableName: "products",
    AttributeDefinitions: [
      { AttributeName: "baseSku", AttributeType: "S" },
      { AttributeName: "variantSku", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "baseSku", KeyType: "HASH" },
      { AttributeName: "variantSku", KeyType: "RANGE" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log("Table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

const createOrdersTable = async () => {
  const params = {
    TableName: "orders",
    AttributeDefinitions: [
      { AttributeName: "orderId", AttributeType: "S" }, // Hash key - order Id
      { AttributeName: "customerId", AttributeType: "S" }, // Attribute for querying by customer id
      { AttributeName: "status", AttributeType: "S" }, // Attribute for querying by status
      { AttributeName: "createdAt", AttributeType: "N" }, // Attribute for querying by date range
    ],
    KeySchema: [
      { AttributeName: "orderId", KeyType: "HASH" }, // Hash key - order Id
    ],
    BillingMode: "PAY_PER_REQUEST", // Set the billing mode to PAY_PER_REQUEST
    GlobalSecondaryIndexes: [
      // GSI for querying all orders by customer id
      {
        IndexName: "customerId-index",
        KeySchema: [
          { AttributeName: "customerId", KeyType: "HASH" }, // GSI Hash key - customerId
          { AttributeName: "status", KeyType: "RANGE" },
        ],
        Projection: {
          ProjectionType: "ALL", // Projection type
        },
      },
      // GSI for querying all orders per status
      {
        IndexName: "status-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" }, // GSI Hash key - status
          { AttributeName: "customerId", KeyType: "RANGE" },
        ],
        Projection: {
          ProjectionType: "ALL", // Projection type
        },
      },
      // GSI for querying all orders per status and date range
      {
        IndexName: "status-createdAt-index",
        KeySchema: [
          { AttributeName: "status", KeyType: "HASH" }, // GSI Hash key - status
          { AttributeName: "createdAt", KeyType: "RANGE" }, // GSI Sort key - createdAt (timestamp)
        ],
        Projection: {
          ProjectionType: "ALL", // Projection type
        },
      },
    ],
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log("Table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

const createUserTable = async () => {
  const params = {
    TableName: "users",
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }, // Hash key
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }, // 'id' is a string attribute
      { AttributeName: "role", AttributeType: "S" }, // 'role' is a string attribute
      { AttributeName: "email", AttributeType: "S" }, //'email' is a string attribute
      { AttributeName: "createdAt", AttributeType: "N" }, //  'createdAt' is a numeric (number) attribute
    ],
    BillingMode: "PAY_PER_REQUEST", // Set the billing mode to PAY_PER_REQUEST
    GlobalSecondaryIndexes: [
      {
        IndexName: "by-role-createdAt-index",
        KeySchema: [
          { AttributeName: "role", KeyType: "HASH" }, // GSI Hash key
          { AttributeName: "createdAt", KeyType: "RANGE" }, // GSI Sort key
        ],
        Projection: {
          ProjectionType: "INCLUDE", // Set projection type to INCLUDE
          NonKeyAttributes: [
            "id",
            "fullName",
            "createdAt",
            "updatedAt",
            "role",
          ],
        },
      },
      {
        IndexName: "by-email-index",
        KeySchema: [
          { AttributeName: "email", KeyType: "HASH" }, // GSI Hash key
        ],
        Projection: {
          ProjectionType: "INCLUDE", // Set projection type to INCLUDE
          NonKeyAttributes: [
            "id",
            "fullName",
            "createdAt",
            "updatedAt",
            "role",
            "password",
          ],
        },
      },
    ],
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log("Table created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};

const createTables = async () => {
  await createProductsTable();
  await createOrdersTable();
  await createUserTable();
};

module.exports = {
  createTables,
};
