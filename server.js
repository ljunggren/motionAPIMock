// Welcome to your JavaScript canvas!
// You can write code here and ask for edits, explanations, or improvements.

const net = require('net');

// Mover object with methods
const mover = {
  x: 0,
  y: 0,
  moveTo(newX, newY) {
    this.x = newX;
    this.y = newY;
    return `Moved to (${this.x}, ${this.y})`;
  },
  moveBy(dx, dy) {
    this.x += dx;
    this.y += dy;
    return `Moved by (${dx}, ${dy}) to (${this.x}, ${this.y})`;
  }
};

// Create a TCP server
const server = net.createServer((socket) => {
  socket.write('Connected to mover API\n');

  socket.on('data', (data) => {
    const input = data.toString().trim();
    const [command, arg1, arg2] = input.split(" ");
    let response = "Unknown command";

    const x = parseFloat(arg1);
    const y = parseFloat(arg2);

    if (command === 'moveTo' && !isNaN(x) && !isNaN(y)) {
      response = mover.moveTo(x, y);
    } else if (command === 'moveBy' && !isNaN(x) && !isNaN(y)) {
      response = mover.moveBy(x, y);
    }

    socket.write(response + '\n');
  });

  socket.on('end', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Mover API server listening on port 4000');
});
