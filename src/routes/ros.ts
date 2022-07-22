import { Request, Response, Router } from "express";
import roscontrollers from "../controllers/ros.controllers";

const router: Router = Router();

router.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});
router.get("/", async (req: Request, res: Response) => {
  res.status(200).send("Ros server.");
});

router.get("/state", roscontrollers.onGetState);
router.get("/waypointCustom", roscontrollers.onPostCustomWaypoint);
router.get("/waypoint", roscontrollers.onPostWaypoint);
router.get("/joystickCmd", roscontrollers.onPostJoystick);

export default router;
