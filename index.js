// Welcome to your JavaScript canvas!
// You can write code here and ask for edits, explanations, or improvements.

const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Movement boundaries and speed limits
const minX = 0, maxX = 1000;
const minY = 0, maxY = 1000;
const maxSpeed = 10;

// Mover object with methods
const mover = {
  x: 0,
  y: 0,
  speed: 1,
  penActive: false,
  moveTo(newX, newY) {
    if (newX < minX || newX > maxX || newY < minY || newY > maxY) {
      console.log(`DENIED: moveTo(${newX}, ${newY}) out of bounds`);
      return `Error: moveTo(${newX}, ${newY}) is out of bounds.`;
    }
    this.x = newX;
    this.y = newY;
    console.log(`DEBUG: moveTo(${newX}, ${newY})`);
    return `Moved to (${this.x}, ${this.y})`;
  },
  moveBy(dx, dy) {
    const newX = this.x + dx;
    const newY = this.y + dy;
    if (newX < minX || newX > maxX || newY < minY || newY > maxY) {
      console.log(`DENIED: moveBy(${dx}, ${dy}) would move out of bounds to (${newX}, ${newY})`);
      return `Error: moveBy(${dx}, ${dy}) would move out of bounds.`;
    }
    this.x = newX;
    this.y = newY;
    console.log(`DEBUG: moveBy(${dx}, ${dy})`);
    return `Moved by (${dx}, ${dy}) to (${this.x}, ${this.y})`;
  },
  setSpeed(newSpeed) {
    if (newSpeed <= 0 || newSpeed > maxSpeed) {
      console.log(`DENIED: setSpeed(${newSpeed}) exceeds limit`);
      return `Error: speed must be between 0 and ${maxSpeed}`;
    }
    this.speed = newSpeed;
    console.log(`DEBUG: setSpeed(${newSpeed})`);
    return `Speed set to ${this.speed}`;
  },
  getPosition() {
    console.log(`DEBUG: getPosition()`);
    return { x: this.x, y: this.y, speed: this.speed, penActive: this.penActive };
  },
  getLimits() {
    return { minX, maxX, minY, maxY, maxSpeed };
  },
  home() {
    this.x = 0;
    this.y = 0;
    console.log(`DEBUG: home()`);
    return `Homed to (0, 0)`;
  },
  calibrate() {
    this.x = 0;
    this.y = 0;
    console.log(`DEBUG: calibrate()`);
    return `Calibrated current position to (0, 0)`;
  },
  activatePen() {
    this.penActive = true;
    console.log(`DEBUG: activatePen()`);
    return `Pen activated (down)`;
  },
  deactivatePen() {
    this.penActive = false;
    console.log(`DEBUG: deactivatePen()`);
    return `Pen deactivated (up)`;
  }
};

// TCP server remains unchanged
const tcpServer = net.createServer((socket) => {
  socket.write('Connected to mover API\n');

  socket.on('data', (data) => {
    try {
      const input = data.toString().trim();
      const [command, arg1, arg2] = input.split(" ");
      let response = "Unknown command";

      const x = parseFloat(arg1);
      const y = parseFloat(arg2);

      if (command === 'moveTo' && !isNaN(x) && !isNaN(y)) {
        response = mover.moveTo(x, y);
      } else if (command === 'moveBy' && !isNaN(x) && !isNaN(y)) {
        response = mover.moveBy(x, y);
      } else if (command === 'setSpeed' && !isNaN(x)) {
        response = mover.setSpeed(x);
      } else if (command === 'getPosition') {
        const pos = mover.getPosition();
        response = `Position: (${pos.x}, ${pos.y}), Speed: ${pos.speed}, Pen: ${pos.penActive ? 'Down' : 'Up'}`;
      } else if (command === 'home') {
        response = mover.home();
      } else if (command === 'calibrate') {
        response = mover.calibrate();
      } else if (command === 'activatePen') {
        response = mover.activatePen();
      } else if (command === 'deactivatePen') {
        response = mover.deactivatePen();
      } else if (command === 'getLimits') {
        const limits = mover.getLimits();
        response = `Limits: x [${limits.minX}, ${limits.maxX}], y [${limits.minY}, ${limits.maxY}], maxSpeed: ${limits.maxSpeed}`;
      }

      socket.write(response + '\n');
    } catch (err) {
      console.error('Error handling data:', err);
    }
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

tcpServer.listen(4000, () => {
  console.log('TCP server listening on port 4000');
});

// Extend HTTP server with /limits endpoint
http.createServer((req, res) => {
  const { method, url } = req;
  let body = [];

  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    body = Buffer.concat(body).toString();
    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET' && url === '/limits') {
      return res.end(JSON.stringify(mover.getLimits()));
    }

    if (method === 'GET' && url === '/getPosition') {
      return res.end(JSON.stringify(mover.getPosition()));
    }
    if (method === 'POST' && url === '/moveTo') {
      const { x, y } = JSON.parse(body);
      return res.end(JSON.stringify({ result: mover.moveTo(x, y) }));
    }
    if (method === 'POST' && url === '/moveBy') {
      const { dx, dy } = JSON.parse(body);
      return res.end(JSON.stringify({ result: mover.moveBy(dx, dy) }));
    }
    if (method === 'PATCH' && url === '/setSpeed') {
      const { speed } = JSON.parse(body);
      return res.end(JSON.stringify({ result: mover.setSpeed(speed) }));
    }
    if (method === 'POST' && url === '/home') {
      return res.end(JSON.stringify({ result: mover.home() }));
    }
    if (method === 'POST' && url === '/calibrate') {
      return res.end(JSON.stringify({ result: mover.calibrate() }));
    }
    if (method === 'POST' && url === '/activatePen') {
      return res.end(JSON.stringify({ result: mover.activatePen() }));
    }
    if (method === 'POST' && url === '/deactivatePen') {
      return res.end(JSON.stringify({ result: mover.deactivatePen() }));
    }

    if (method === 'GET' && url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      const { x, y, speed, penActive } = mover.getPosition();
      return res.end(`
        <html>
          <head><title>Mover API</title></head>
          <body>
            <h1>Mover API Landing Page</h1>
            <p>Welcome to the robot controller API.</p>
            <p><strong>Current Position:</strong> (${x}, ${y})</p>
            <p><strong>Current Speed:</strong> ${speed}</p>
            <p><strong>Pen Status:</strong> ${penActive ? 'Down' : 'Up'}</p>
            <ul>
              <li><code>GET /getPosition</code></li>
              <li><code>GET /limits</code></li>
              <li><code>POST /moveTo</code> with JSON { x, y }</li>
              <li><code>POST /moveBy</code> with JSON { dx, dy }</li>
              <li><code>PATCH /setSpeed</code> with JSON { speed }</li>
              <li><code>POST /home</code></li>
              <li><code>POST /calibrate</code></li>
              <li><code>POST /activatePen</code></li>
              <li><code>POST /deactivatePen</code></li>
            </ul>
          </body>
        </html>
      `);
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  });
}).listen(4001, () => {
  console.log('HTTP API server listening on port 4001');
});
