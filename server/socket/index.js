const { getLatestBlock, addBlock, getState, replaceChain } = require('../blockchain');

/*
 ---------------
 SOCKET INFO
 ---------------
 */
const sockets = [];
const QUERY_LATEST = 0;
const QUERY_ALL = 1;
const RESPONSE_BLOCKCHAIN = 2;

/*
 ---------------------
 MESSAGE HELPER METHODS
 ---------------------
 */
const write = (socket, message) => socket.emit("message", JSON.stringify(message));
const broadcast = (message) => sockets.forEach(socket => write(socket, message));
const queryAllMsg = () => ({'type': QUERY_ALL});

const responseChainMsg = () =>({
  'type': RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getState())
});

const responseLatestMsg = () => ({
  'type': RESPONSE_BLOCKCHAIN,
  'data': JSON.stringify([getLatestBlock()])
});

const handleBlockchainResponse = (message) => {
    const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            addBlock(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

/*
 -------------------------
 CONNECTION HELPER METHODS
 -------------------------
 */

const closeConnection = (socket) => {
  console.log('connection failed to peer: ' + socket.url);
  sockets.splice(sockets.indexOf(socket), 1);
};

/*
 -----------------
 INITIALIZE SOCKET
 -----------------
 */

module.exports = io => {
  io.on('connection', socket => {
    sockets.push(socket);
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      closeConnection(socket);
      console.log(`Connection ${socket.id} has left the building`)
    })

    socket.on('error', () => {
      closeConnection(socket);
      console.log(`Connection ${socket.id} threw an error`)
    });

    socket.on('message', (data) => {
        const message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case QUERY_LATEST:
              write(socket, responseLatestMsg());
              break;
            case QUERY_ALL:
              write(socket, responseChainMsg());
              break;
            case RESPONSE_BLOCKCHAIN:
              handleBlockchainResponse(message);
              break;
            default:
              console.log("shit!!");
        }
    });

  })
}
