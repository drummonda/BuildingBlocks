const WebSocket = require("ws");
const socketio = require('socket.io-client');
const ioserver = require('socket.io');
const P2P = process.env.P2P_PORT || 6001;
const url = `ws://localhost:${P2P}`;

const {
  handleBlockchainResponse,
  responseLatestMsg,
  responseChainMsg,
  RESPONSE_BLOCKCHAIN,
  QUERY_ALL,
  QUERY_LATEST
} = require('./utils')

/*
 ---------------
 SOCKET INFO
 ---------------
 */
const sockets = [];

/*
 -------------------------
 HELPER METHODS
 -------------------------
 */

const write = (socket, message) => socket.emit("message", message);
const broadcast = (message) => sockets.forEach(socket => write(socket, message));

const getPeers = () => (
  sockets.map(s => s.request.connection.remoteAddress + ':' + s.request.connection.remotePort)
)

const closeConnection = socket => {
  console.log('connection failed to peer: ' + socket.url);
  sockets.splice(sockets.indexOf(socket), 1);
};

/*
 -----------------
 INITIALIZE SOCKET
 -----------------
 */

const initErrorHandler = socket => {
  socket.on('disconnect', () => {
    closeConnection(socket);
    console.log(`Connection ${socket.id} has left the building`)
  })

  socket.on('error', () => {
    closeConnection(socket);
    console.log(`Connection ${socket.id} threw an error`)
  });
}

const initConnection = socket => {
    sockets.push(socket);
    initErrorHandler(socket);
    write(socket, responseChainMsg());
};

const initP2PServer = () => {
  const server = ioserver(6001);
  server.on('connection', ws => initConnection(ws));
  console.log('listening websocket p2p port on: ' + P2P);
};

const initServer = io => {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`);
    initConnection(socket);

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}

module.exports = {
  getPeers,
  initServer,
  initP2PServer,
  write,
  broadcast,
  closeConnection,
  responseLatestMsg,
  handleBlockchainResponse,
  responseChainMsg,
  RESPONSE_BLOCKCHAIN,
  QUERY_ALL,
  QUERY_LATEST
}
