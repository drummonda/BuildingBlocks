import io from 'socket.io-client';
import { getState, getLatestBlock, addBlock, replaceChain } from '../server/blockchain';
import store, { setBlockchain, updateStatus } from './store';

const ws = io(window.location.origin);

/*
 ---------------------
 CONSTANTS
 ---------------------
 */
const QUERY_LATEST = 'QUERY_LATEST';
const QUERY_ALL = 'QUERY_ALL';
const RESPONSE_BLOCKCHAIN = 'RESPONSE_BLOCKCHAIN';


/*
 ---------------------
 MESSAGE HELPER METHODS
 ---------------------
 */
const write = (socket, message) => socket.send("message", message);
// const broadcast = (message) => sockets.forEach(socket => write(socket, message));

const queryChainLengthMsg = () => ({'type': QUERY_LATEST});
const queryAllMsg = socket => socket.emit('message', {'type': QUERY_ALL});

const responseChainMsg = () =>({
  'type': RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(getState())
});

const responseLatestMsg = blockchain => ({
  'type': RESPONSE_BLOCKCHAIN,
  'data': JSON.stringify([blockchain])
});

/*
 -----------------
 UTILITY METHODS
 -----------------
 */
const handleBlockchainResponse = (socket, message) => {
    try {
      const receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
      const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
      const latestBlockHeld = getLatestBlock();
      if (latestBlockReceived.index > latestBlockHeld.index) {
          store.dispatch(updateStatus('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index));
          if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
              store.dispatch(updateStatus("We can append the received block to our chain"));
              const newBlocks = addBlock(latestBlockReceived);
              store.dispatch(updateStatus("Received blockchain is valid, Replacing current blockhain with received blockchain"));
              store.dispatch(setBlockchain(newBlocks));
              write(socket, responseLatestMsg(newBlocks));
          } else if (receivedBlocks.length === 1) {
              store.dispatch(updateStatus("We have to query the chain from our peer"));
              write(socket, queryAllMsg());
          } else {
              store.dispatch(updateStatus("Received blockchain is longer than current blockchain"));
              const newBlocks = replaceChain(receivedBlocks);
              store.dispatch(updateStatus("Received blockchain is valid, Replacing current blockhain with received blockchain"));
              write(socket, responseLatestMsg(newBlocks));
          }
      } else {
          store.dispatch(updateStatus('received blockchain is not longer than current blockchain. Do nothing'));
      }
    } catch (err) {
      console.error(err);
    }
};


const initMessageHandler = socket => {
  socket.on('message', message => {
    console.log(message.type)
    switch (message.type) {
      case QUERY_LATEST:
        write(socket, responseLatestMsg());
        break;
      case QUERY_ALL:
        write(socket, responseChainMsg());
        break;
      case RESPONSE_BLOCKCHAIN:
        handleBlockchainResponse(socket, message);
        break;
      default:
        console.log("shit!!");
    }
  });
}

/*
 -----------------
 INITIALIZE SOCKET
 -----------------
 */
ws.on('connect', () => {
  store.dispatch(updateStatus('Connected to network!'));
  initMessageHandler(ws);

  ws.on('disconnect', () => {
    store.dispatch(updateStatus('Disconnected from network'));
  })
});

export default ws
