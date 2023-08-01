const aws = require("aws-sdk");
if (process.env.RUNNING_CI === "YES" || process.env.NODE_ENV === "test") {
  aws.config.update({
    region: "ap-south-1",
    endpoint: "http://localhost:8000",
  });
} else {
  aws.config.update({
    region: "ap-south-1",
  });
}
const dynamodb = new aws.DynamoDB();
const deleteTable = async (name) => {
  const params = {
    TableName: name,
  };

  try {
    await dynamodb.deleteTable(params).promise();
    console.log("Table deleted successfully.");
  } catch (err) {
    console.error("Error deleting table:", err);
  }
};

const cleanupTables = async () => {
  await deleteTable("products");
  await deleteTable("users");
  await deleteTable("orders");
};

module.exports = {
  cleanupTables,
};
