const {
  getState,
  addBlockToChain,
  getGenesisBlock,
  generateNextBlock,
  generateRawNextBlock,
  getLatestBlock,
  replaceChain,
  isValidBlockStructure,
  getAccountBalance,
  generateNextBlockWithTransaction
} = require('./blockchain');

module.exports = {
  getState,
  addBlockToChain,
  getGenesisBlock,
  generateNextBlock,
  generateRawNextBlock,
  getLatestBlock,
  replaceChain,
  isValidBlockStructure,
  getAccountBalance,
  generateNextBlockWithTransaction
}
