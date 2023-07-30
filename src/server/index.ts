import express from "express";
import passport from "passport";
import { Logger } from "@pizza/logger";
import routes from "@pizza/api/routes";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UserService } from "@pizza/api/services";

export class Server {
  private server: express.Express;

  constructor() {
    this.server = express();
    this.addMiddleware();
    this.addRoutes();
  }

  addMiddleware() {
    this.server.use(express.json());
    this.server.use(passport.initialize());
  }

  addRoutes() {
    this.server.use(routes);
  }

  getServer() {
    return this.server;
  }

  configureAuthMiddleware() {
    const jwtOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    };

    // Create the JWT strategy
    const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
      const { sub } = payload;
      const user = await UserService.getUserById(sub);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    });

    passport.use(jwtStrategy);
  }

  startServer(port: number) {
    this.configureAuthMiddleware();
    // start the Express server
    this.server.listen(port, () => {
      Logger.log(`⚡️ server started at http://localhost:${port}`);
    });
  }
}

export default new Server();
