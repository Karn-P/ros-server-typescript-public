# ros-server-typescript

## Overview 
This is a repository of ros-typescript-server.

## Installation 
_ROS Server_ requires [Node.js](https://nodejs.org/) v16.14+ to run and [express.js](https://expressjs.com/) to run.

Clone the repository and install the dependencies

```sh
git clone https://github.com/Karn-P/ros-server-typescript.git
cd ros-server-typescript
```
```sh
npm install
yarn install
```

## Running the project
To run this software, you need to follow severals step to configure the behavior of the software. 
The software will listen on port 3001 by default, which can be run by execute
  
   ```sh
   npm start
   ```
   ```sh
   yarn start
   ```
   or execute in dev mode using
   ```sh
   npm run dev
   ```
   ```sh
   yarn dev
   ```
   
## Dependencies
_ROS Server_ uses a number of open source projects to work properly:

- [node.js] - Asynchronous event-driven JavaScript runtime environment, suitable for non-blocking I/O needed application.
- [express] - Node.js web application framework, serving RESTful API.
- [typescript] - TypeScript compiles to readable, standards-based JavaScript.
- [mongoose] - Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.
- [three] - The lightweight, cross-browser, general purpose 3D library. 
- [roslib] - Roslib is the base dependency of all ROS Client Libraries and tools.
- [serialport] - Node.js package to access serial ports. Linux, OSX and Windows.
- [events] - Node's event emitter for all engines.
