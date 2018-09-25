const { getState, addBlockToChain, getGenesisBlock, generateNextBlock, getLatestBlock, replaceChain, isValidBlockStructure } = require('./blockchain');

module.exports = {
  getState,
  addBlockToChain,
  getGenesisBlock,
  generateNextBlock,
  getLatestBlock,
  replaceChain,
  isValidBlockStructure
}
