import express, { Request, Response, Router } from "express";
import rosRoute from "./ros";
const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello, this is bms-server");
});
router.use("/ros", rosRoute);

export default router;
