import request from "supertest";
import server from "../../src/server/index";

const app = server.getServer();

describe("Integration test for / route", () => {
  test("should return a welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message:
        "WELCOME TO PENNYWHISTLE PIZZA WEB API. VISIT API DOCUMENTATION AT /docs",
    });
  });
});
