# Mover Robot API

This project implements a simple robot controller API in Node.js with both **TCP socket** and **HTTP REST** interfaces.

## Features

* Move the robot to an absolute or relative position
* Limit motion to a bounded area
* Control pen (up/down)
* Get and set speed with validation
* Home and calibrate origin
* Debug output for all actions

## Usage

### 🔌 TCP Socket Interface (port `4000`)

Connect via terminal:

```sh
nc localhost 4000
```

**Commands:**

* `moveTo x y`
* `moveBy dx dy`
* `setSpeed s`
* `getPosition`
* `home`
* `calibrate`
* `activatePen`
* `deactivatePen`
* `getLimits`

### 🌐 HTTP API (port `4001`)

**Endpoints:**

* `GET /` — Landing page (HTML)
* `GET /getPosition` — Returns position, speed, and pen status
* `GET /limits` — Returns movement and speed limits
* `POST /moveTo` — Body: `{ "x": 123, "y": 456 }`
* `POST /moveBy` — Body: `{ "dx": 10, "dy": -5 }`
* `PATCH /setSpeed` — Body: `{ "speed": 2.5 }`
* `POST /home`
* `POST /calibrate`
* `POST /activatePen`
* `POST /deactivatePen`

## Constraints

* `minX = 0`, `maxX = 1000`
* `minY = 0`, `maxY = 1000`
* `maxSpeed = 10`

Out-of-bound or excessive-speed commands are **denied** with error feedback.

## Run the Server

```sh
node mover.js
```

Make sure `node` is installed and the ports `4000` and `4001` are free.

## License

MIT