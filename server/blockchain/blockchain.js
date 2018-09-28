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
  isValidBlockStructure,
  generateRawNextBlock,
  generateNextBlockWithTransaction,
  handleReceivedTransaction,
  getMyUnspentTransactionOutputs,
  getAccountBalance,
  sendTransaction,
  getUnspentTxOuts,
  makeTransaction,
  addTransaction
}

// const { broadcastLatest, broadcastTransactionPool } = require('../socket');

const {
  createTransaction,
  getBalance,
  findUnspentTxOuts,
  getPrivateFromWallet,
  getPublicFromWallet,
  createUnsignedTransaction
} = require('./wallet');

const {
  getCoinbaseTransaction,
  isValidAddress,
  processTransactions
} = require('./transactions');

const {
  addToTransactionPool,
  getTransactionPool,
  updateTransactionPool
} = require('./transactionPool');

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

const genesisTransaction = {
    'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    'txOuts': [{
        'address': '047d9e416d82996580000e08ac68782804531cee90e6627f76915daf2bba78caa63ba3cf8a7cd604bc2d057a4977f6b962e2db8c4d4bb013f771b650cf0141e795',
        'amount': 50
    }],
    'id': '08ca104071f2574e3730d04fc7b1d79367fd1e9bd95298cc4567a3b8b20ae320'
};

function getGenesisBlock() {
  return new Block(0, "0", 1465154705, [genesisTransaction], "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", 0, 0)
}

function genesisBlock() {
  return getGenesisBlock();
}

function isValidBlockStructure(block) {
  return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.previousHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string'
}


// THE BLOCKCHAIN STATE

const defaultBlockchain = [genesisBlock()]

let state = {
  blockchain: defaultBlockchain,
  unspentTxOuts: processTransactions(defaultBlockchain[0].data, [], 0)
}

function getState() {
  return state.blockchain;
}

function getUnspentTxOuts() {
  return state.unspentTxOuts;
}

function updateState(blockchain) {
  state = { ...state, blockchain };
}

function updateUTxOs(uTxOs) {
  state = { ...state, unspentTxOuts: uTxOs }
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
  let aUnspentTxOuts = [];

  for(let i = 1; i < blockchainToValidate.length; i++) {
    const currentBlock = blockchainToValidate[i];
    if(i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i-1])) {
      console.log("the block was not valid", blockchainToValidate[i]);
      return false;
    }

    aUnspentTxOuts = processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
    if(aUnspentTxOuts === null) {
      console.log('invalid transactions in blockchain');
      return false;
    }
  }
  return aUnspentTxOuts;
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
  const aUnspentTxOuts = isValidChain(newBlocks);
  const validChain = aUnspentTxOuts !== null;
  if(validChain &&
     getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getState())) {
    console.log('received blockchain is valid, replacing current blockchain with received blockchain');
    updateState(newBlocks);
    const uTxOs = getUnspentTxOuts();
    updateTransactionPool(uTxOs);
    // broadcastLatest();
    return getState();
  } else {
    throw new Error('Received blockchain invalid')
  }
}

function addBlockToChain(newBlock) {
  const latestBlock = getLatestBlock();
  if (isValidNewBlock(newBlock, latestBlock)) {
      const returnVal = processTransactions(newBlock.data, getUnspentTxOuts(), newBlock.index);
      if(returnVal === null) {
        return false;
      } else {
        const newBlockchain = [...state.blockchain, newBlock];
        updateUTxOs(returnVal);
        const unspentTxOuts = getUnspentTxOuts();
        updateTransactionPool(unspentTxOuts);
        const result = replaceChain(newBlockchain);
        return result;
      }
  } else {
    throw new Error('The new block was not valid!');
  }
}

function generateNextBlock() {
  const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
  const blockData = [coinbaseTx];
  return generateRawNextBlock(blockData);
}

function generateRawNextBlock(blockData) {
  const previousBlock = getLatestBlock();
  const difficulty = getDifficulty(getState());
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000;
  const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty);
  const newBlockchain = addBlockToChain(newBlock);
  if(newBlockchain) {
    // broadcastLatest();
    return newBlockchain;
  } else {
    return null;
  }
}

function getMyUnspentTransactionOutputs() {
  return findUnspentTxOuts(getPublicFromWallet(), getUnspentTxOuts);
}

function generateNextBlockWithTransaction(receiverAddress, senderAddress, privateKey, amount) {
  if(!isValidAddress(receiverAddress)) {
    throw Error('invalid address');
  }
  if(typeof amount !== 'number') {
    throw Error('invalid ammount');
  }
  const coinbaseTx = getCoinbaseTransaction(getPublicFromWallet(), getLatestBlock().index + 1);
  const tx = createTransaction(receiverAddress, senderAddress, amount, privateKey, getUnspentTxOuts());
  const blockData = [coinbaseTx, tx];

  return generateRawNextBlock(blockData);
}

function getAccountBalance(address) {
  return getBalance(address, getUnspentTxOuts());
}

function sendTransaction(receiverAddress, senderAddress, amount, privateKey) {
  const tx = createTransaction(receiverAddress, senderAddress, amount, privateKey, getUnspentTxOuts());
  addToTransactionPool(tx, getUnspentTxOuts());
  // broadcastTransactionPool();
  return tx;
}

function makeTransaction(receiverAddress, senderAddress, amount) {
  const unsignedTx = createUnsignedTransaction(receiverAddress, senderAddress, amount, getUnspentTxOuts());
  return unsignedTx;
}

function addTransaction(tx) {
  addToTransactionPool(tx, getUnspentTxOuts());
  // broadcastTransactionPool();
  return tx;
}

function handleReceivedTransaction(transaction) {
  addToTransactionPool(transaction, getUnspentTxOuts());
}


