const _ = require('lodash');
const { Transaction, TxIn, UnspentTxOut, validateTransaction } = require('./transactions');

module.exports = {
  addToTransactionPool,
  getTransactionPool,
  updateTransactionPool
}

let state = {
  transactionPool: [],
};

function getTransactionPool() {
  return _.cloneDeep(state.transactionPool);
}

function addTransaction(tx) {
  state = {...state, transactionPool: [...state.transactionPool, tx]};
}

function replacePool(newPool) {
  state = { transactionPool: newPool };
}

function addToTransactionPool(tx, unspentTxOuts) {
  if(!validateTransaction(tx, unspentTxOuts)) {
    throw Error('trying to add invalid tx to pool');
  }

  if(!isValidTxForPool(tx, getTransactionPool())) {
    throw Error('trying to add invalid tx to pool');
  }

  console.log('adding to txPool: ', JSON.stringify(tx));
  addTransaction(tx);
}

function hasTxIn(txIn, unspentTxOuts) {
  const foundTxIn = unspentTxOuts
    .find(uTxO => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex)
  return foundTxIn !== undefined;
}

function updateTransactionPool(unspentTxOuts) {
  const transactionPool = getTransactionPool();
  const invalidTxs = [];
  for(const tx of transactionPool) {
    for(const txIn of tx.txIns) {
      if(!hasTxIn(txIn, unspentTxOuts)) {
        invalidTxs.push(tx);
        break;
      }
    }
  }
  if(invalidTxs.length > 0) {
    console.log('removing the following transactions from transaction pool', JSON.stringify(invalidTxs));
    replacePool(_.without(transactionPool, ...invalidTxs));
  }
}

function getTxPoolIns(aTransactionPool) {
  return _(aTransactionPool)
    .map(tx => tx.txIns)
    .flatten()
    .value();
}

function isValidTxForPool(tx, aTransactionPool) {
  const txPoolIns = getTxPoolIns(aTransactionPool);
  const containsTxIn = (txIns, txIn) => {
    return _.find(txPoolIns, (txPoolIn => {
      return txIn.txOutIndex === txPoolIn.txOutIndex
             && txIn.txOutId === txPoolIn.txOutId
    }))
  };
  for(const txIn of tx.txIns) {
    if(containsTxIn(txPoolIns, txIn)) {
      console.log('txIn already found in the pool');
      return false;
    }
  }
  return true;
}
