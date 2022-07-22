export interface IRos {
  name: string;
  ip: string;
  port: string;
  type: string;
  pollInterval: number;
  topics: Topics;
  waypoints: Waypoint;
}

export interface IRobotState {
  x: number;
  y: number;
  orientation: number;
  linear_vel: number;
  angular_vel: number;
  battery: number;
  time_remain: number;
}

export interface Topics {
  CMD_VEL_TOPIC: string;
  POSE_TOPIC: string;
  ODOM_TOPIC: string;
  MOVE_BASE_TOPIC: string;
  MOVE_BASE_RESULT: string;
}

export interface Waypoint {
  f1: {
    homerobot: {
      position: {
        x: number;
        y: number;
        z: number;
      };
      orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    };
    cleanroomrobot: {
      position: {
        x: number;
        y: number;
        z: number;
      };
      orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    };
    exitrobot: {
      position: {
        x: number;
        y: number;
        z: number;
      };
      orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
      };
    };
  };
}
