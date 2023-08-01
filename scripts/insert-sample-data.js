const aws = require("aws-sdk");

aws.config.update({
  region: "ap-south-1",
  endpoint: "http://localhost:8000",
});

const documentClient = new aws.DynamoDB.DocumentClient();

const users = [
  {
    id: "b0968154-3762-48d2-9096-1239bda82908",
    createdAt: 1690699216379,
    email: "lakindu@gmail.com",
    fullName: "Lakindu",
    password: "$2b$10$L0IWrSvWyV68y9qcU4URD.jvJ1tBGFrp31JOdG16jBGJD1pFoKg.e",
    role: "customer",
    updatedAt: 1690699216379,
  },
  {
    id: "85841b95-bf81-4e38-944d-1ff5fb79c19d",
    createdAt: 1690690095805,
    email: "lakinduhewa@gmail.com",
    fullName: "Lakindu",
    password: "$2b$10$9fesXPb3aCphlF6kO0yMYOPqmUlZjNN.jbRIfijklDOTOFzBm9Pcy",
    role: "internal_administrator",
    updatedAt: 1690690095805,
  },
];

const sampleProducts = [
  {
    baseSku: "MARGERITA_PIZZA",
    variantSku: "MARGERITA_PIZZA",
    name: "Margerita Pizza",
  },
  {
    baseSku: "MARGERITA_PIZZA",
    variantSku: "MARGERITA_PIZZA_SMALL",
    price: "39",
    size: "SMALL",
    type: "THIN_CRUST",
  },
  {
    baseSku: "MARGERITA_PIZZA",
    variantSku: "MARGERITA_PIZZA_LARGE",
    price: "49",
    size: "LARGE",
    type: "THIN_CRUST",
  },
  {
    baseSku: "MARGERITA_PIZZA",
    variantSku: "MARGERITA_PIZZA_REGULAR",
    price: "45",
    size: "REGULAR",
    type: "THIN_CRUST",
  },
];

const insertUsersData = async () => {
  for (const user of users) {
    const params = {
      TableName: "users",
      Item: user,
    };

    try {
      await documentClient.put(params).promise();
      console.log("User data inserted successfully:", user.id);
    } catch (err) {
      console.error("Error inserting user data:", err, user.id);
    }
  }
};

const insertSampleProductsData = async () => {
  for (const product of sampleProducts) {
    const params = {
      TableName: "products",
      Item: product,
    };

    try {
      await documentClient.put(params).promise();
      console.log("Product data inserted successfully:", product.variantSku);
    } catch (err) {
      console.error(
        "Error inserting product data:",
        err,
        `${product.baseSku}#${product.variantSku}`
      );
    }
  }
};

const insertSampleData = async () => {
  await insertUsersData();
  await insertSampleProductsData();
}

module.exports = {
  insertSampleData
}