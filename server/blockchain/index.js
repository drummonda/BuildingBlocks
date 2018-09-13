const { getState, addBlock, getGenesisBlock, generateNextBlock, getLatestBlock, replaceChain } = require('./blockchain');

module.exports = {
  getState,
  addBlock,
  getGenesisBlock,
  generateNextBlock,
  getLatestBlock,
  replaceChain
}
