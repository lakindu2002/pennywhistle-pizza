import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    info: {
      title: "Pennywhistle Pizza Web API",
      version: "1.0.0",
      description:
        "This is the API documentation for the Web API for Pennywhistle Pizza",
    },
  },
  apis: ["./src/api/routes/index.ts", "./src/swagger/schemas.ts"],
};

const specs = swaggerJsdoc(swaggerOptions);

export { specs };
