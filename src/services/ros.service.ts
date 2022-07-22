import net, { Server, Socket } from "net";
import { SerialPort } from "serialport";
import EventEmitter from "events";
import Three, { Euler } from "three";
import ROSLIB from "roslib";

import { IRobotState, IRos, Topics, Waypoint } from "../global/types";

class SocketClient {
  connectionName: string;
  type: string;
  ip: string;
  port: string;
  pollInterval: number;
  interface: EventEmitter;
  socket: Socket;
  constructor(rosConfig: IRos) {
    this.connectionName = rosConfig.name;
    this.type = rosConfig.type;

    this.ip = rosConfig.ip;
    this.port = rosConfig.port;
    this.pollInterval = rosConfig.pollInterval || 10;

    this.interface = new EventEmitter();

    this.setupConnections();
  }

  setupConnections() {
    this.connect().catch((reject: string) => {
      this.printRejectNotice(reject);
      this.handleConnectionError(reject);
    });
  }

  printRejectNotice(reject: string) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to reconnect to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  handleConnectionError(reject: string) {
    setTimeout(() => {
      this.connect().catch((reject) => {
        this.handleConnectionError(reject);
      });
    }, this.pollInterval * 1000);
  }

  connect() {
    if (!this.socket) {
      this.socket = new net.Socket();
    }
    return new Promise((resolve, reject) => {
      this.socket.connect(Number(this.port), this.ip, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.socket.on("data", (data: any) => {
        this.interface.emit("received", data);
      });

      this.socket.on("end", () => {
        console.log("Client disconnected");
      });

      this.socket.on("error", (err: { message: any }) => {
        this.socket.removeAllListeners("error");
        this.socket.removeAllListeners("data");
        this.socket.removeAllListeners("end");
        this.socket.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class SocketServer extends SocketClient {
  server: Server;
  constructor(rosConfig: IRos) {
    super(rosConfig);
  }

  printRejectNotice(reject: string) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to re-listen to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  connect() {
    if (!this.server) {
      this.server = net.createServer((socket) => {
        console.log("Client socket connected to socker server");
        socket.on("data", (data) => {
          this.interface.emit("received", data);
        });

        socket.on("end", () => {
          console.log("Client Disconnected");
        });
      });
    }
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(
          `${this.connectionName} ${this.type}: Listening on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.server.on("error", (err: { code: string; message: any }) => {
        if (err.code === "EADDRINUSE") {
          console.log("Address in use, retrying...");
          this.server.close();
        }
        reject(err.message);
      });
    });
  }
}

class CSerialPort extends SocketClient {
  serialPort: SerialPort;
  constructor(rosConfig: IRos) {
    super(rosConfig);
  }

  connect() {
    if (!this.serialPort) {
      this.serialPort = new SerialPort({
        path: `/dev/${this.port}`,
        baudRate: 115200,
        autoOpen: false,
        lock: false,
      });
    }
    return new Promise((resolve, reject) => {
      this.serialPort.open(() => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.port}`
        );
        resolve(true);
      });
      this.serialPort.on("data", (data: any) => {
        this.interface.emit("received", data);
      });
      this.serialPort.on("error", (err: { message: any }) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.serialPort.removeAllListeners("error");
        this.serialPort.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class RosService extends SocketClient {
  topics: Topics;
  waypoints: Waypoint;
  connectionState: boolean;
  robotState: IRobotState;
  ros: any;

  constructor(rosConfig: IRos) {
    super(rosConfig);
    this.topics = rosConfig.topics;
    this.waypoints = rosConfig.waypoints;

    this.connectionState = false;

    this.robotState = {
      x: 0,
      y: 0,
      orientation: 0,
      linear_vel: 0,
      angular_vel: 0,
      battery: 50,
      time_remain: 13,
    };
  }

  getState(state: string): IRobotState {
    return this.robotState[state];
  }

  joystickCmd(linear: number, angular: number) {
    const cmd_vel = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/Twist",
    });

    let adjX = Math.cos(angular * (Math.PI / 180));
    let adjZ = Math.sin(angular * (Math.PI / 180));

    if (angular >= 90 && angular <= 270) {
      adjZ = adjZ;
    } else {
      adjZ = -adjZ;
    }

    console.log(`Angular : ${angular}`);
    console.log(adjX);
    console.log(adjZ);
    const twist = new ROSLIB.Message({
      linear: {
        x: (adjX * linear) / 3,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: (adjZ * linear) / 3,
      },
    });

    cmd_vel.publish(twist);
  }

  waypointCustom(x: number, y: number) {
    const actionClient = new ROSLIB.ActionClient({
      ros: this.ros,
      serverName: "/move_base",
      actionName: "move_base_msgs/MoveBaseAction",
      timeout: 1000,
    });
    const positionVec3 = new ROSLIB.Vector3(null);

    const orientation = new ROSLIB.Quaternion(null);

    positionVec3.x = x;
    positionVec3.y = y;
    positionVec3.z = 0;

    //orientation
    orientation.x = 0;
    orientation.y = 0;
    orientation.z = 0;
    orientation.w = 1;

    //Create package POSE
    const pose = new ROSLIB.Pose({
      position: positionVec3,
      orientation: orientation,
    });

    const goal = new ROSLIB.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: pose,
        },
      },
    });
    goal.send();
  }

  waypointCmd(desiredPlace: string, waypoint: string) {
    const actionClient = new ROSLIB.ActionClient({
      ros: this.ros,
      serverName: "/move_base",
      actionName: "move_base_msgs/MoveBaseAction",
      timeout: 1000,
    });
    const positionVec3 = new ROSLIB.Vector3(null);

    const orientation = new ROSLIB.Quaternion(null);

    const place = this.waypoints[desiredPlace];
    positionVec3.x = place[waypoint].position.x;
    positionVec3.y = place[waypoint].position.y;
    positionVec3.z = place[waypoint].position.z;

    //orientation
    orientation.x = place[waypoint].orientation.x;
    orientation.y = place[waypoint].orientation.y;
    orientation.z = place[waypoint].orientation.z;
    orientation.w = place[waypoint].orientation.w;

    //Create package POSE
    const pose = new ROSLIB.Pose({
      position: positionVec3,
      orientation: orientation,
    });

    const goal = new ROSLIB.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: pose,
        },
      },
    });
    goal.send();
  }

  updateRobotState() {
    const pose_subscriber = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.POSE_TOPIC,
      messageType: "geometry_msgs/PoseWithCovarianceStamped",
    });

    pose_subscriber.subscribe((message: any) => {
      this.robotState.x = message.pose.pose.position.x.toFixed(4);
      this.robotState.y = message.pose.pose.position.y.toFixed(4);
      this.robotState.orientation = Number(
        this.getOrientationFromQuaternion(message.pose.pose.orientation)
      );
    });

    const velocity_subscriber = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.ODOM_TOPIC,
      messageType: "nav_msgs/Odometry",
    });

    velocity_subscriber.subscribe((message: any) => {
      this.robotState.linear_vel = message.twist.twist.linear.x.toFixed(4);
      this.robotState.angular_vel = message.twist.twist.angular.z.toFixed(4);
    });
  }

  getOrientationFromQuaternion(ros_orientation_quaternion: {
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
    w: number | undefined;
  }) {
    const q = new Three.Quaternion(
      ros_orientation_quaternion.x,
      ros_orientation_quaternion.y,
      ros_orientation_quaternion.z,
      ros_orientation_quaternion.w
    );
    const RPY: Euler = new Three.Euler().setFromQuaternion(q);
    return RPY["_z"] * (180 / Math.PI);
  }

  connect() {
    if (!this.ros) {
      this.ros = new ROSLIB.Ros({ url: `${this.ip}:${this.port}` });

      this.ros.on("connection", () => {
        this.connectionState = true;
        this.updateRobotState();
        console.log("Connected to ROS");
      });

      this.ros.on("close", () => {
        this.connectionState = false;
        console.log("Connection is closing");
      });
    }

    return new Promise((resolve, reject) => {
      this.ros.connect("ws://" + this.ip + ":" + this.port, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.ros.on("error", (err: { message: any }) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.connectionState = false;
        this.ros.removeAllListeners("error");
        this.ros.removeAllListeners("connection");
        this.ros.removeAllListeners("close");
        reject(err.message);
      });
    });
  }
}

export { SocketClient, SocketServer, CSerialPort as SerialPort, RosService };
