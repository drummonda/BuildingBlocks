const CryptoJS = require("crypto-js");

const calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

const calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

// const handleBlockchainResponse = (message) => {
//     var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
//     var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
//     var latestBlockHeld = getLatestBlock();
//     if (latestBlockReceived.index > latestBlockHeld.index) {
//         console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
//         if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
//             console.log("We can append the received block to our chain");
//             blockchain.push(latestBlockReceived);
//             // broadcast(responseLatestMsg());
//         } else if (receivedBlocks.length === 1) {
//             console.log("We have to query the chain from our peer");
//             // broadcast(queryAllMsg());
//         } else {
//             console.log("Received blockchain is longer than current blockchain");
//             replaceChain(receivedBlocks);
//         }
//     } else {
//         console.log('received blockchain is not longer than current blockchain. Do nothing');
//     }
// };

module.exports = {
    calculateHash,
    calculateHashForBlock,
}
