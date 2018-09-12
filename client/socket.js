import io from 'socket.io-client';
import { getState, getLatestBlock, addBlock, replaceChain } from '../server/blockchain';
const ws = io(window.location.origin);

const QUERY_LATEST = 0;
const QUERY_ALL = 1;
const RESPONSE_BLOCKCHAIN = 2;

const write = (socket, message) => socket.emit("message", message);
// const broadcast = (message) => sockets.forEach(socket => write(socket, message));

const queryAllMsg = socket => socket.emit('message', {'type': QUERY_ALL});

const responseChainMsg = () =>({
  'type': RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getState())
});

const responseLatestMsg = block => ({
  'type': RESPONSE_BLOCKCHAIN,
  'data': JSON.stringify([block])
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
            // broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            // broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

const initMessageHandler = sock => {
  sock.on('message', ({ data }) => {
    console.log(data);
    const message = JSON.parse(data);
    console.log('Received message' + JSON.stringify(message));
    switch (message.type) {
      case QUERY_LATEST:
        write(responseLatestMsg());
        break;
      case QUERY_ALL:
        write(ws, responseChainMsg());
        break;
      case RESPONSE_BLOCKCHAIN:
        console.log('here');
        handleBlockchainResponse(message);
        break;
      default:
        console.log("shit!!");
    }
  });
}


ws.on('connect', () => {
  console.log('Connected!')

  initMessageHandler(ws);
});

export default ws
