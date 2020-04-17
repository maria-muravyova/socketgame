const server = require('net').createServer();
const PORT = 8000;
const COUNT_OF_REQUIRED_USERS_IN_ROOM = 2;

let counter = 0;

const sockets = {};

const rooms = {
  '1': {
    id: '1',
    users: [],
  }
}

server.on('connection', socket => {
  socket.id = generateId();
  socket.roomId = null;

  sockets[socket.id] = socket;
  console.log(`Client ${socket.id} connected`);
  printClientsCount();

  socket.write(`Your id is ${socket.id}. Please wait, while free room won't be found.\n`);

  addCustomListenersForSocket(socket);
  socket.on('data', socketDataHandler);
  socket.on('end', socketEndHandler);
});

// Helper functions
function generateId() {
  return String(counter++);
}

function addCustomListenersForSocket(socket) {
  socket.addListener('roomFound', (roomId) => {
    socket.write(`We have found room for you. Id of room is ${roomId}.\n`);
  });

  socket.addListener('opponentFound', (opponentId) => {
    socket.write(`We have found opponent for you. Id of your opponent: ${opponentId}.\n`);
  });

  socket.addListener('opponentDisconnected', () => {
    socket.write(`Your opponent was disconnected. Please, wait until we found new one.\n`);
  });
}

function socketDataHandler(data) {
  console.log(`Client #${this.id} sent message: ${data.toString()}`);
}

function socketEndHandler() {
  delete sockets[this.id];
  console.log(`Client ${this.id} disconnected`);
  printClientsCount();

  const roomId = '1';
  const room = rooms[roomId];

  if (userInRoom(room, this.id)) {
    removeUserFromRoom(room, this.id);
  }
}

function userInRoom(room, socketId) {
  return room.users.indexOf(socketId) !== -1;
}

function removeUserFromRoom(room, socketId) {
  const index = room.users.indexOf(socketId);
  room.users.splice(index, 1);
  if (room.users.length !== 0) {
    sockets[room.users[0]].emit('opponentDisconnected');
  }
}

function printClientsCount() {
  console.log(`Number of connected clients: ${Object.keys(sockets).length}`);
}

// Main
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

setInterval(() => {
  for (const socketId in sockets) {
    const socket = sockets[socketId];
    if (socket.roomId !== null) {
      processClientWithoutRoom(socket);
    } else {
      processClientWithRoom(socket);
    }
  }
}, 1000);

// Main cycle processors
function processClientWithoutRoom(socket) {
  if (rooms[socket.roomId].users.length === COUNT_OF_REQUIRED_USERS_IN_ROOM) {
    socket.write('Waiting for your opponent decision...\n');
  } else {
    socket.write('Searching opponent for you.\n');
  }
}

function processClientWithRoom(socket) {
  const roomId = '1';
  const room = rooms[roomId];
  
  if (room.users.length === COUNT_OF_REQUIRED_USERS_IN_ROOM) {
    socket.write('There are no free rooms. Please, wait.\n');
  } else {
    addClientToRoom(room, socket);
  }
}

function addClientToRoom(room, socket) {
  const roomId = room.id;
  const socketId = socket.id;
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
