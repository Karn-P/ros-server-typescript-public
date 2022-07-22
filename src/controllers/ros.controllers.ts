import { Request, Response } from "express";
import {
  SocketClient,
  SocketServer,
  SerialPort,
  RosService,
} from "../services/ros.service";
import rosConfig from "../configs/robot";
const ROS = new RosService(rosConfig);

const rosController = {
  async onGetState(req: Request, res: Response) {
    const topic: string = req.query.topic!.toString();
    // res.send(new RosService.getState(topic).toString()).end();
    res.send(ROS.getState(topic).toString()).end();
  },

  async onPostCustomWaypoint(req: Request, res: Response) {
    const x = Number(req.query.x);
    const y = Number(req.query.y);

    console.log(`X: ${x}, Y: ${y}`);
    res.set("Content-Type", "text/html");
    try {
      ROS.waypointCustom(x, y);
      res
        .send(
          `Your waypoint command to (${x},${y}) is successfully dispatched!`
        )
        .end();
    } catch {
      res
        .send(`Error on dispatching the waypoint command to (${x},${y})`)
        .end();
    }
  },

  async onPostWaypoint(req: Request, res: Response) {
    const place: string = req.query.place!.toString().toLowerCase();
    const waypoint: string = req.query.waypoint!.toString().toLowerCase();
    console.log(`Place: ${place}, Waypoint: ${waypoint}`);
    res.set("Content-Type", "text/html");

    try {
      ROS.waypointCmd(place, waypoint);
      res
        .send(
          `Your waypoint command to ${place}:${waypoint} is successfully dispatched!`
        )
        .end();
    } catch {
      res
        .send(
          `Error on dispatching the waypoint command to ${place}:${waypoint}`
        )
        .end();
    }
  },

  async onPostJoystick(req: Request, res: Response) {
    const linear: number = Number(req.query.linear);
    const angular: number = Number(req.query.angular);
    console.log(`linear = ${linear}`);
    console.log(`angular = ${angular}`);
    res.set("Content-Type", "text/html");
    try {
      ROS.joystickCmd(linear, angular);
      console.log(`Your joystick command is
      successfully dispatched!, Linear: ${linear}, Angular: ${angular}`);
      res
        .send(
          `Your joystick command is successfully dispatched!, Linear: ${linear}, Angular: ${angular}`
        )
        .end();
    } catch {
      res.send(`Error on dispatching the joystick command`).end();
    }
  },
};

export default rosController;
