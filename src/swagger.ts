import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Books API",
      version: "1.0.0",
      description: "API for searching books by author or publisher",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
    ],
  },
  apis: ["./src/routes/**/*.ts", "./src/server.ts"],
};

export default swaggerJsdoc(options);
