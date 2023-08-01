import request from "supertest";
import server from "../../src/server/index";

const app = server.getServer();

describe("Integration test for /health route", () => {
  test("should return a health message", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Healthy",
    });
  });
});
