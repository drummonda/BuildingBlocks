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
  generateNextBlockWithTransaction,
  handleReceivedTransaction,
  getMyUnspentTransactionOutputs,
  sendTransaction,
  getUnspentTxOuts

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
  generateNextBlockWithTransaction,
  handleReceivedTransaction,
  getMyUnspentTransactionOutputs,
  getAccountBalance,
  sendTransaction,
  getUnspentTxOuts
}
