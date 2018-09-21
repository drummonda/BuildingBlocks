module.exports = {
  initServer,
  initP2PServer,
  responseLatestMsg,
  broadcast,
  connectToPeers,
  broadcastLatest,
  getSockets
}

const WebSocket = require('ws');

const {
  addBlockToChain,
  getLatestBlock,
  isValidBlockStructure,
  replaceChain,
  getState
} = require('../blockchain')

/*
 ---------------
 SOCKET INFO
 ---------------
 */
let state = {
  sockets: []
}

function getSockets() {
  return state.sockets;
}

function setSockets(sockets) {
  state = { sockets }
}

function addSocket(socket) {
  state = {...state, sockets: [...state.sockets, socket]};
}

function removeSocket(socket) {
  const sockets = getSockets();
  const updated = sockets.filter(s => s !== socket);
  setSockets(updated);
}

/*
 -------------------------
 MESSAGE SETUP
 -------------------------
 */
const QUERY_LATEST = 'QUERY_LATEST';
const QUERY_ALL = 'QUERY_ALL';
const RESPONSE_BLOCKCHAIN = 'RESPONSE_BLOCKCHAIN';

/*
 -------------------------
 HELPER METHODS
 -------------------------
 */

function closeConnection(socket) {
  console.log('connection failed to peer: ' + socket.url);
  removeSocket(socket);
};

function JSONToObject(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
  }
}

/*
 -----------------
 SOCKET MESSAGE HANDLING
 -----------------
 */

function write(ws, message) {
  ws.send(JSON.stringify(message));
}

function broadcast(message) {
  const connSockets = getSockets();
  connSockets.forEach(socket => write(socket, message));
}

function queryChainLengthMsg() {
  return { type: QUERY_LATEST, data: null };
}

function queryAllMsg() {
  return { type: QUERY_ALL, data: null };
}

function responseChainMsg() {
  return {
    type: RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(getState())
  }
}

function responseLatestMsg() {
  return {
    type: RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock()])
  }
}

function getReceivedBlocks(message) {
  const receivedBlocks = JSONToObject(message.data);
  if(!receivedBlocks) {
    console.log('invalid blocks received');
    return false;
  }
  return receivedBlocks;

}

function handleBlockchainResponse(receivedBlocks) {
  if(receivedBlocks.length === 0) {
    console.log('received blockchain of size 0');
    return;
  }
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  if(!isValidBlockStructure(latestBlockReceived)) {
    console.log('Block structure not valid');
    return
  }
  const latestBlockHeld = getLatestBlock();
  if(latestBlockReceived.index > latestBlockHeld.index) {
    console.log('Blockchain possibly behind');
    if(latestBlockHeld.hash === latestBlockReceived.previousHash) {
      if(addBlockToChain(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if(receivedBlocks.length === 1) {
      console.log('We have to query the chain from our peer');
      broadcast(queryAllMsg());
    } else {
      console.log('Received blockchain is longer than current blockchain');
      replaceChain(receivedBlocks);
    }
  } else {
    console.log('Received blockchain is not longer than current blockchain, do nothing');
  }
}

function initMessageHandler(ws) {
  ws.on('message', data => {
    const message = JSONToObject(data);
    if(message === null) {
      console.log('could not parse received JSON message')
      return
    }
    console.log(`Received message`, message);
    switch(message.type) {
      case QUERY_LATEST:
        write(ws, responseLatestMsg());
        break;

      case QUERY_ALL:
        write(ws, responseChainMsg());
        break;

      case RESPONSE_BLOCKCHAIN:
        const receivedBlocks = getReceivedBlocks(message);
        if(receivedBlocks) handleBlockchainResponse(receivedBlocks);
        break;

      default:
        console.log('shit!!');
    }
  })
}

function broadcastLatest() {
  broadcast(responseLatestMsg());
}

function connectToPeers(newPeer) {
  const ws = new WebSocket(newPeer);
  ws.on('open', () => {
    initConnection(ws);
  });
  ws.on('error', () => {
    console.log('connection failed')
  });
}

/*
 -----------------
 INITIALIZE SOCKET
 -----------------
 */

function initErrorHandler(socket) {
  socket.on('disconnect', () => {
    closeConnection(socket);
    console.log(`Connection ${socket.id} has left the building`)
  })

  socket.on('error', () => {
    closeConnection(socket);
    console.log(`Connection ${socket.id} threw an error`)
  });
}

function initConnection(socket) {
    addSocket(socket);
    initMessageHandler(socket);
    initErrorHandler(socket);
    write(socket, responseChainMsg());
};

function verify(info) {
  //console.log("verifying", info);
  return true;
}

function initP2PServer(p2p) {
  const server = new WebSocket.Server({port: p2p });
  server.on('connection', ws => {
    initConnection(ws);
  })
  console.log('listening websocket p2p port on: ' + p2p);
};

function initServer(io) {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`);
    initConnection(socket);

    socket.on('disconnect', () => {
      console.log(`Connection ${socket.id} has left the building`)
    })
  })
}
