import express, { Application } from "express";
import { Server } from "http";
import route from "./routes";
import expressConfig from "./configs/express";

const app: Application = express();
const config: any = "./configs/app";

expressConfig(app);
app.use(route);

const PORT: number = config.PORT || 9999;
const server: Server = app.listen(PORT, () => {
  console.log(`Server is on Port ${PORT}`);
});
