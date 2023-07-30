import ExpressServer from "@pizza/server";

require("dotenv").config();

ExpressServer.startServer(Number(process.env.APP_PORT) || 3000);
