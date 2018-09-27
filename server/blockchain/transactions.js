const CryptoJS = require('crypto-js');
const ecdsa = require('elliptic');
const _ = require('lodash');

const ec = new ecdsa.ec('secp256k1');
const COINBASE_AMOUNT = 50;

/*
TRANSACTION CLASS DECLARATIONS
*/
class TxOut {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

class TxIn {
  constructor() {
    this.txOutId = null;
    this.txOutIndex = null;
    this.signature = null;
  }
}

class Transaction {
  constructor() {
    this.id = null;
    this.txIns = [];
    this.txOuts = [];
  }
}

class UnspentTxOut {
  constructor(txOutId, txOutIndex, address, amount) {
    this.txOutId = txOutId;
    this.txOutIndex = txOutIndex;
    this.address = address;
    this.amount = amount;
  }
}


/*
UTXO STATE
*/
let state = {
  unspentTxOuts: [],
}

function getUTxOs() {
  return state.unspentTxOuts;
}


/*
HELPER METHODS
*/
function getTransactionId(transaction) {
  const txInContent = transaction.txIns
    .map(txIn => txIn.txOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b, '');

  const txOutContent = transaction.txOuts
    .map(txOut => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, '');

  return CryptoJS.SHA256(txInContent + txOutContent).toString();
}

// Make sure that a referenced txIn is valid from txOut
// ----------------------------------------------------
function validateTxIn(txIn, transaction, aUnspentTxOuts) {
  // Find the referenced unspent transaction output
  const referencedUTxOut = aUnspentTxOuts
    .find(uTxO => uTxO.txOutId === txIn.txOutId && uTxO.txOutId === txIn.txOutId);
  if(!referencedUTxOut){
    console.log('referenced txOut not found: ', JSON.stringify(txIn));
    return false;
  }
  // Grab the referenced unspent transaction output address
  const address = referencedUTxOut.address;
  // Grab the public key from transaction address
  const key = ec.keyFromPublic(address, 'hex');
  // Verify that the transaction id came from the txIn signature
  return key.verify(transaction.id, txIn.signature);
}

// Check that the transaction meets all requirements
// ----------------------------------------------------
function validateTransaction(transaction, aUnspentTxOuts) {
  // Does does the transaction id match what it's supposed to?
  if(getTransactionId(transaction) !== transaction.id) {
    console.log('invalid tx id: ', transaction.id);
    return false;
  }

  // Are all of the transaction inputs to this transaction valid?
  const hasValidTxIns = transaction.txIns
      .map(txIn => validateTxIn(txIn, transaction, aUnspentTxOuts))
      .reduce((a, b) => a && b, true);

  // Valid?
  if(!hasValidTxIns) {
    console.log('some of the txIns are invalid in tx: ', transaction.id);
    return false;
  }

  // Add up all of the transaction's associated transaction input amts
  const totalTxInValues = transaction.txIns
      .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
      .reduce((a, b) => a + b, 0);

  // Add up all of the transaction's associated txOut amounts
  const totalTxOutValues = transaction.txOuts
      .map(txOut => txOut.amount)
      .reduce((a, b) => a + b, 0);

  // Does the total of the inputs equal the total of the outputs?
  if(totalTxOutValues !== totalTxInValues) {
    console.log('totalTxOutValues !== totalTxInValues in tx: ', transaction.id);
    return false;
  }

  // Finally, return true if none of these conditions have failed
  return true;
}

// Check that the Coinbase transaction is valid
// ----------------------------------------------------
function validateCoinbaseTx(transaction, blockIndex) {
  // Is the first transaction in the block the coinbase one
  if(transaction === null) {
    console.log('the first transaction in the block must be a coinbase transaction');
    return false;
  }
  // Does the coinbase transaction id match what it's supposed to
  if(getTransactionId(transaction) !== transaction.id) {
    console.log('invalid coinbase tx id: ', transaction.id);
    return false;
  }
  // Is there a single transaction input specified
  if(transaction.txIns.length !== 1) {
    console.log('one txIn must be specified in the coinbase transaction');
    return false;
  }
  // Is the transaction input signature the block height?
  if(transaction.txIns[0].txOutIndex !== blockIndex) {
    console.log('the txIn signature in coinbase tx must be the block height');
    return false;
  }
  // Should only be one transaction output in the coinbase transaction
  if(transaction.txOuts.length !== 1) {
    console.log('invalid number of txOuts in the coinbase transaction');
    return false;
  }
  // Does the transaction output amount equal the coinbase amount?
  if(transaction.txOuts[0].amount !== COINBASE_AMOUNT) {
    console.log('invalid coinbase amount in coinbase transaction');
    return false;
  }
  // Finally, if nothing has returned false, return true
  return true;
}

// Get the transaction input amount
// ----------------------------------------------------
function getTxInAmount(txIn, aUnspentTxOuts) {
  return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
}

// Find any unspent transaction outputs
// ----------------------------------------------------
function findUnspentTxOut(transactionId, index, aUnspentTxOuts) {
  return aUnspentTxOuts.find(uTxO => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
}

// Grab the coinbase transaction
// ----------------------------------------------------
function getCoinbaseTransaction(address, blockIndex) {
  const t = new Transaction();
  const txIn = new TxIn();
  txIn.signature = "";
  txIn.txOutId = "";
  txIn.txOutIndex = blockIndex;
  t.txIns = [txIn];
  t.txOuts = [new TxOut(address, COINBASE_AMOUNT)];
  t.id = getTransactionId(t);
  return t;
}

function signTxIn(transaction, txInIndex, txInNumber, privateKey, aUnspentTxOuts) {
  const txIn = transaction.txIns[txInIndex];
  const dataToSign = transaction.id;
  const referencedUnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
  if(referencedUnspentTxOut === null) {
    console.log('could not find referenced unspent transaction output');
    throw Error('No transaction output found');
  }
  const referencedAddress = referencedUnspentTxOut.address;

  if(getPublicKey(privateKey) !== referencedAddress) {
    console.log('trying to sign an input with private key that does not match'
                + 'the address that is referenced in the txIn');
    throw Error('private key does not match referenced address');
  }
  const key = ec.keyFromPrivate(privateKey, 'hex');
  const signature = toHexString(key.sign(dataToSign).toDER());
  return signature;
}

// function newUnspentTxOuts(newTransactions, aUnspentTxOuts) {
//   const newUnspentTxOuts = newTransactions
//       .map(t => t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount)))
//       .reduce((a, b) => a.concat(b), []);

//   const consumedTxOuts = newTransactions
//       .map(t => t.txIns)
//       .reduce((a, b) => a.concat(b), [])
//       .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

//   const resultingUnspentTxOuts = aUnspentTxOuts
//       .filter(uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))
//       .concat(newUnspentTxOuts);

//   return resultingUnspentTxOuts;
// }

// Make sure that all transactions related to a block are valid
function validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex) {
  const coinbaseTx = aTransactions[0];

  // Is the coinbase transaction valid?
  if(!validateCoinbaseTx(coinbaseTx, blockIndex)) {
    console.log('invalid coinbase transaction', coinbaseTx);
    return false;
  }

  // Check for duplicate transactions
  const txIns = _(aTransactions)
    .map(tx => tx.txIns)
    .flatten()
    .value();

  if(hasDuplicates(txIns)) return false;

  // Now, validate all but the coinbase transaction
  const normalTransactions = aTransactions.slice(1);
  return normalTransactions.map(tx => validateTransaction(tx, aUnspentTxOuts))
                           .reduce((a, b) => (a && b), true);

}

function hasDuplicates(txIns) {
  const groups = _.countBy(txIns, txIn => txIn.txOutId + txIn.txOutId);
  return _(groups)
    .map((value, key) => {
      if(value > 1) {
        console.log('duplicate transaction', key);
        return true;
      } else {
        return false;
      }
    })
    .includes(true);
}

function updateUnspentTxOuts(newTransactions, aUnspentTxOuts) {
  const newUnspentTxOuts = newTransactions
    .map(t => t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount)))
    .reduce((a, b) => a.concat(b), []);

  const consumedTxOuts = newTransactions
    .map(t => t.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

  const resultingUnspentTxOuts = aUnspentTxOuts
    .filter(uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts))
    .concat(newUnspentTxOuts);

  return resultingUnspentTxOuts;
}

function processTransactions(aTransactions, aUnspentTxOuts, blockIndex) {

  if(!isValidTransactionsStructure(aTransactions)) return null;

  if(!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
    console.log('invalid block transactions');
    return null;
  }

  return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
}

function toHexString(byteArray) {
  return Array.from(byteArray, byte => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

function getPublicKey(aPrivateKey) {
  return ec.keyFromPrivate(aPrivateKey, 'hex').getPublic().encode('hex');
}

function isValidTxInStructure(txIn) {
  if(txIn === null) {
    console.log('txIn is null');
    return false;
  } else if (typeof txIn.signature !== 'string') {
    console.log('invalid signature type in txIn');
    return false;
  } else if (typeof txIn.txOutId !== 'string') {
    console.log('invalid txOutId type in txIn');
    return false;
  } else if (typeof  txIn.txOutIndex !== 'number') {
    console.log('invalid txOutIndex type in txIn');
    return false;
  } else {
    return true;
  }
}

function isValidTxOutStructure(txOut) {
  if(txOut === null) {
    console.log('txOut is null');
    return false;
  } else if(typeof txOut.address !== 'string') {
    console.log('invalid address type in txOut');
    return false;
  } else if (!isValidAddress(txOut.address)) {
    console.log('invalid TxOut address');
    return false;
  } else if (typeof txOut.amount !== 'number') {
    console.log('invalid amount type in txOut');
    return false;
  } else {
    return true;
  }
}

function isValidTransactionsStructure(transactions) {
  return transactions
    .map(isValidTransactionStructure)
    .reduce((a, b) => (a && b), true)
}

function isValidTransactionStructure(transaction) {
  if(typeof transaction.id !== 'string') {
    console.log('transactionId missing');
    return false;
  }
  if(!(transaction.txIns instanceof Array)) {
    console.log('invalid txIns type in transaction');
    return false;
  }
  if(!transaction.txIns
      .map(isValidTxInStructure)
      .reduce((a, b) => (a && b), true)) {
    return false;
  }
  if(!(transaction.txOuts instanceof Array)) {
    console.log('invalid txIns type in transaction');
    return false;
  }
  if(!transaction.txOuts
        .map(isValidTxOutStructure)
        .reduce((a, b) => (a && b), true)) {
    return false;
  }
  return true;
}

function isValidAddress(address) {
  if(address.length !== 130) {
    console.log('invalid public key length');
    return false;
  } else if(address.match('^[a-fA-F0-9]+$') === null) {
    console.log('public key must contain only hex characters');
    return false;
  } else if(!address.startsWith('04')) {
    console.log('public key must start with 04');
    return false;
  }
  return true;
}

module.exports = {
  processTransactions,
  signTxIn,
  getTransactionId,
  isValidAddress,
  UnspentTxOut,
  TxIn,
  TxOut,
  getCoinbaseTransaction,
  getPublicKey,
  Transaction,
  getUTxOs
}
