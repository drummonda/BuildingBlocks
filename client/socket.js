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
const BLOCKCHAIN_BEHIND = 'BLOCKCHAIN_BEHIND';
const APPEND_MESSAGE = "We can append the received block to our chain";
const VALID_MESSAGE = "Received blockchain is valid, Replacing current blockhain with received blockchain";
const QUERY_MESSAGE = "We have to query the chain from our peer";
const RECEIVED_GREATER_MESSAGE = "Received blockchain is longer than current blockchain";
const REPLACE_MESSAGE = "Received blockchain is valid, Replacing current blockhain with received blockchain";
const DO_NOTHING_MESSAGE = "Received blockchain is not longer than current blockchain. Do nothing";

/*
 ---------------------
 MESSAGE HELPER METHODS
 ---------------------
 */
const write = (socket, message) => socket.send("message", message);
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

const status = message => {
  store.dispatch(updateStatus(message));
};

const updateBlockchain = blockchain => {
  store.dispatch(setBlockchain(blockchain));
}

const isBehind = (blockOne, blockTwo) => blockOne.index > blockTwo.index;
const behindMessage = (blockOne, blockTwo) => `blockchain possibly behind. We got: ${blockOne.index} while peer got: ${blockTwo.index}`;
const sortReceivedBlocks = received => JSON.parse(received).sort((b1, b2) => (b1.index - b2.index));

const queryFromPeer = socket => {
  status(QUERY_MESSAGE);
  write(socket, queryAllMsg());
}

const replaceMyBlocks = (receivedBlocks, socket) => {
  status(RECEIVED_GREATER_MESSAGE);
  const newBlocks = replaceChain(receivedBlocks);
  status(REPLACE_MESSAGE);
  write(socket, responseLatestMsg(newBlocks));
}

const appendNewBlocks = (latestBlocks, socket) => {
  status(APPEND_MESSAGE);
  const newBlocks = addBlock(latestBlocks);
  status(VALID_MESSAGE);
  updateBlockchain(newBlocks);
  write(socket, responseLatestMsg(newBlocks));
}

const handleBlockchainResponse = (socket, message) => {
    try {
      const receivedBlocks = sortReceivedBlocks(message.data);
      const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
      const latestBlockHeld = getLatestBlock();
      if (isBehind(latestBlockReceived, latestBlockHeld)) {
          status(behindMessage(latestBlockHeld, latestBlockReceived));
          if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
              appendNewBlocks(latestBlockReceived, socket);
          } else if (receivedBlocks.length === 1) {
              queryFromPeer(socket);
          } else {
              replaceMyBlocks(receivedBlocks, socket);
          }
      } else {
          status(DO_NOTHING_MESSAGE);
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
