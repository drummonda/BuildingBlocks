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
  generateNextBlockFromTxPool,
  handleReceivedTransaction,
  getMyUnspentTransactionOutputs,
  sendTransaction,
  getUnspentTxOuts,
  makeTransaction,
  addTransaction

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
  generateNextBlockFromTxPool,
  handleReceivedTransaction,
  getMyUnspentTransactionOutputs,
  getAccountBalance,
  sendTransaction,
  getUnspentTxOuts,
  makeTransaction,
  addTransaction
}
