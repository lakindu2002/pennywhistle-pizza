const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB({ region: 'ap-south-1' });

const deleteTable = async () => {
  const params = {
    TableName: 'users',
  };

  try {
    await dynamodb.deleteTable(params).promise();
    console.log('Table deleted successfully.');
  } catch (err) {
    console.error('Error deleting table:', err);
  }
};

const createUserTable = async () => {
  const params = {
    TableName: 'users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Hash key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }, // Assuming 'id' is a string attribute
      { AttributeName: 'role', AttributeType: 'S' }, // Assuming 'role' is a string attribute
      { AttributeName: 'email', AttributeType: 'S' }, // Assuming 'email' is a string attribute
      { AttributeName: 'createdAt', AttributeType: 'N' } // Assuming 'createdAt' is a numeric (number) attribute
    ],
    BillingMode: 'PAY_PER_REQUEST', // Set the billing mode to PAY_PER_REQUEST
    GlobalSecondaryIndexes: [
      {
        IndexName: 'by-role-createdAt-index',
        KeySchema: [
          { AttributeName: 'role', KeyType: 'HASH' }, // GSI Hash key
          { AttributeName: 'createdAt', KeyType: 'RANGE' } // GSI Sort key
        ],
        Projection: {
          ProjectionType: 'INCLUDE', // Set projection type to INCLUDE
          NonKeyAttributes: ['id', 'fullName', 'createdAt', 'updatedAt', 'role'] // Specify the projected attributes
        }
      },
      {
        IndexName: 'by-email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }, // GSI Hash key
        ],
        Projection: {
          ProjectionType: 'INCLUDE', // Set projection type to INCLUDE
          NonKeyAttributes: ['id', 'fullName', 'createdAt', 'updatedAt', 'role', "password"] // Specify the projected attributes
        }
      }
    ]
  };

  try {
    await dynamodb.createTable(params).promise();
    console.log('Table created successfully.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

// Call the functions to delete and recreate the table
(async () => {
  await deleteTable();
  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
  await createUserTable();
})();
