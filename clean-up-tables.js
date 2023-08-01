const aws = require("aws-sdk");
const dynamodb = new aws.DynamoDB({
  region: "ap-south-1",
  ...((process.env.NODE_ENV === "test" || process.env.RUNNING_CI == "YES") && {
    endpoint: "http://localhost:8000",
  }),
});
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

(async () => {
  await deleteTable("products");
  await deleteTable("users");
  await deleteTable("orders");
})();

module.exports = {
  cleanupTables,
};
