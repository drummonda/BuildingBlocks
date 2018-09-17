const {
  calculateHashForBlock,
  calculateHash,
  hashMatchesDifficulty,
  getAccumulatedDifficulty,
  getAdjustedDifficulty,
  DIFFICULTY_ADJUSTMENT_INTERVAL } = require("./utils");

module.exports = {
  getGenesisBlock,
  generateNextBlock,
  getLatestBlock,
  getState,
  addBlockToChain,
  replaceChain,
  hashMatchesDifficulty,
  isValidBlockStructure
}

const { broadcastLatest, broadcast } = require('../socket');

// BLOCKCHAIN CONSTRUCTOR METHODS
class Block {
    constructor(index, previousHash, timestamp, data, hash, difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

function getGenesisBlock() {
  return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", 0, 0)
}

function genesisBlock() {
  return getGenesisBlock();
}

function isValidBlockStructure() {
  return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.previousHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string'
}


// THE BLOCKCHAIN STATE

let state = {
  blockchain: [genesisBlock()]
}

function getState() {
  return state.blockchain;
}

function updateState(blockchain) {
  state = {
    blockchain
  };
}

// BLOCKCHAIN UTILITY METHODS
function isValidGenesis(block) {
  return JSON.stringify(block) === JSON.stringify(genesisBlock());
}

function getLatestBlock() {
  return state.blockchain.slice(-1)[0]
}

function getDifficulty(blockchain) {
  const latestBlock = getLatestBlock();
  if(latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0
     && latestBlock.index !== 0) {
    console.log('difficulty', getAdjustedDifficulty(latestBlock, blockchain))
    return getAdjustedDifficulty(latestBlock, blockchain);
  } else {
    return latestBlock.difficulty;
  }
}

function isValidNewBlock(newBlock, previousBlock) {
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

function isValidChain(blockchainToValidate) {
  if(!isValidGenesis(blockchainToValidate[0])) return false;
  for(let i = 1; i < blockchainToValidate.length; i++) {
    if(!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i-1])) {
      console.log("the block was not valid", blockchainToValidate[i]);
      return false;
    }
  }
  return true;
}

function findBlock(index, previousHash, timestamp, data, difficulty) {
  let nonce = 0;
  let searching = true;
  while(searching) {
    const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
    if(hashMatchesDifficulty(hash, difficulty)) {
      return new Block(index, previousHash, timestamp, data, hash, difficulty, nonce);
    }
    nonce++;
  }
}

function replaceChain(newBlocks) {
  if(isValidChain(newBlocks) &&
     getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getState())) {
    console.log('received blockchain is valid, replacing current blockchain with received blockchain');
    updateState(newBlocks);
    broadcastLatest();
    return getState();
  } else {
    throw new Error('Received blockchain invalid')
  }
}

function addBlockToChain(newBlock) {
  const latestBlock = getLatestBlock();
  if (isValidNewBlock(newBlock, latestBlock)) {
      const newBlockchain = [...state.blockchain, newBlock];
      const result = replaceChain(newBlockchain);
      return result;
  } else {
    throw new Error('The new block was not valid!');
  }
}

function generateNextBlock(blockData) {
  const previousBlock = getLatestBlock();
  const difficulty = getDifficulty(getState());
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000;
  const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
  const newBlockchain = addBlockToChain(newBlock);
  broadcastLatest()
  return newBlockchain;
}
