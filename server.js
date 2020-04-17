const server = require('net').createServer();
const PORT = 8000;
const COUNT_OF_REQUIRED_USERS_IN_ROOM = 2;

let counter = 0;

function generateId() {
  return String(counter++);
  // return (Date.now().toString() + Math.random()).replace('.','');
}

const sockets = {};

const rooms = {
  '1': {
    users: [],
  }
}

server.on('connection', socket => {
  socket.id = generateId();
  socket.roomId = null;

  sockets[socket.id] = socket;
  console.log('Client connected');
  console.log(`Number of connected clients: ${Object.keys(sockets).length}`);

  socket.write(`Your id is ${socket.id}. Please wait, while free room won't be found.\n`);

  socket.addListener('roomFound', (roomId) => {
    socket.write(`We have found room for you. Id of room is ${roomId}.\n`);
  });

  socket.addListener('opponentFound', (opponentId) => {
    socket.write(`We have found opponent for you. Id of you opponent: ${opponentId}.\n`);
  });

  socket.addListener('opponentDisconnected', () => {
    socket.write(`Your opponent was disconnected. Please, wait until we found new one.\n`);
  });

  socket.on('data', data => {
    console.log(`Client #${socket.id} sent message: ${data.toString()}`);
  });

  socket.on('end', () => {
    delete sockets[socket.id];
    console.log('Client disconnected');
    console.log(`Number of connected clients: ${Object.keys(sockets).length}`);

    const roomId = '1';
    const room = rooms[roomId];

    const index = room.users.indexOf(socket.id);
    if (index !== -1) {
      room.users.splice(index, 1);
      if (room.users.length !== 0) {
        sockets[room.users[0]].emit('opponentDisconnected');
      }
    }
  });
});

server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

setInterval(() => {
  for (const socketId in sockets) {
    const socket = sockets[socketId];
    if (socket.roomId !== null) {
      if (rooms[socket.roomId].users.length === COUNT_OF_REQUIRED_USERS_IN_ROOM) {
        socket.write('Waiting for your opponent decision...\n');
      } else {
        socket.write('Searching opponent for you.\n');
      }
    } else {
      const roomId = '1';
      const room = rooms[roomId];
      
      if (room.users.length === COUNT_OF_REQUIRED_USERS_IN_ROOM) {
        socket.write('There are no free rooms. Please, wait.\n');
      } else {
        let opponentId = null; 
        if (room.users.length !== 0) {
          opponentId = room.users[0];
        }

        room.users.push(socketId);
        socket.roomId = roomId;
        socket.emit('roomFound', roomId);

        if (opponentId !== null) {
          const opponentSocket = sockets[opponentId];
          opponentSocket.emit('opponentFound', socketId);
          socket.emit('opponentFound', opponentId);
        } 
      }
    }
  }
}, 1000);
