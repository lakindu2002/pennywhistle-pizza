import express from "express";
import { Logger } from "@pizza/logger";
import routes from "@pizza/api/routes";

export class Server {
  private server: express.Express;

  constructor() {
    this.server = express();
    this.addMiddleware();
    this.addRoutes();
  }

  addMiddleware() {
    this.server.use(express.json());
  }

  addRoutes() {
    this.server.use(routes);
  }

  getServer() {
    return this.server;
  }

  startServer(port: number) {
    // start the Express server
    this.server.listen(port, () => {
      Logger.log(`⚡️ server started at http://localhost:${port}`);
    });
  }
}

export default new Server();
