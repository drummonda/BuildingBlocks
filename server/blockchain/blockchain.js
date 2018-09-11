const { calculateHashForBlock, calculateHash } = require("./utils")

// BLOCKCHAIN CONSTRUCTOR METHODS
class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
    }
}

const getGenesisBlock = () => (
  new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7")
)

// THE BLOCKCHAIN STATE

let state = {
  blockchain: [getGenesisBlock()]
}

const getState = () => state.blockchain;

const updateState = blockchain => {
  state = {
    blockchain
  };
}

// BLOCKCHAIN UTILITY METHODS
const getLatestBlock = () => (
  state.blockchain.slice(-1)[0]
)

const isValidNewBlock = (newBlock, previousBlock) => {
  if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index');
      return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash');
      return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
      console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
      console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
      return false;
  }
  return true;
}

const generateNextBlock = blockData => {
  const previousBlock = getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000;
  const nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
  return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
}

const isValidChain = blockchainToValidate => {
  if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
      return false;
  }
  const tempBlocks = blockchainToValidate.slice(0, 1);
  for (let i = 1; i < blockchainToValidate.length; i++) {
      if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
          tempBlocks.push(blockchainToValidate[i]);
      } else {
          return false;
      }
  }
  return true;
}

const replaceChain = newBlocks => {
  if (isValidChain(newBlocks) && newBlocks.length > state.blockchain.length) {
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      updateState(newBlocks);
      return newBlocks;
      // broadcast(responseLatestMsg());
  } else {
      throw new Error('Received blockchain invalid');
  }
}

const addBlock = newBlock => {
  const latestBlock = getLatestBlock();
  if (isValidNewBlock(newBlock, latestBlock)) {
      const newBlockchain = [...state.blockchain, newBlock];
      const result = replaceChain(newBlockchain);
      return result;
  } else {
    throw new Error('The new block was not valid!');
  }
}

module.exports = {
  state,
  getGenesisBlock,
  generateNextBlock,
  getState,
  addBlock
}
