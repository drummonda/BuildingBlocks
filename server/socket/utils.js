const { getLatestBlock, addBlock, getState, replaceChain } = require('../blockchain');
const { broadcast } = require('./index');

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


module.exports = {
  handleBlockchainResponse,
  responseLatestMsg,
  responseChainMsg,
  queryChainLengthMsg,
  queryAllMsg,
  RESPONSE_BLOCKCHAIN,
  QUERY_ALL,
  QUERY_LATEST
}
