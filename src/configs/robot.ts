import { IRos } from "../global/types";

const ros: IRos = {
  name: "Robot Team Test",
  ip: "192.168.0.211",
  port: "9090",
  type: "RosBridgeClient",
  pollInterval: 5,
  topics: {
    CMD_VEL_TOPIC: "/cmd_vel",
    POSE_TOPIC: "/amcl_pose",
    ODOM_TOPIC: "/odom",
    MOVE_BASE_TOPIC: "/move_base",
    MOVE_BASE_RESULT: "/move_base/result",
  },
  waypoints: {
    f1: {
      homerobot: {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        orientation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
      },
      cleanroomrobot: {
        position: {
          x: 2.7,
          y: 5,
          z: 0,
        },
        orientation: {
          x: 0,
          y: 0,
          z: 90,
          w: 1,
        },
      },
      exitrobot: {
        position: {
          x: -4,
          y: 5.75,
          z: 0,
        },
        orientation: {
          x: 0,
          y: 0,
          z: 0,
          w: 1,
        },
      },
    },
  },
};

export default ros;
