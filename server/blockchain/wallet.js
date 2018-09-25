const { ec } = require('elliptic');
const { existsSync, readFileSync, unlinkSync, writeFileSync } = require('fs');
const _ = require('lodash');
const { getPublicKey, getTransactionId, signTxIn, Transaction, TxIn, TxOut,
        UnspentTxOut } = require ('./transactions');


module.exports = {
  createTransaction,
  getPublicFromWallet,
  getPrivateFromWallet,
  getBalance,
  generatePrivateKey,
  initWallet
}

const EC = new ec('secp256k1');
const privateKeyLocation = '../../node/wallet/private_key.txt';

function getPrivateFromWallet() {
  const buffer = readFileSync(privateKeyLocation, 'utf8');
  return buffer.toString();
}

function getPublicFromWallet() {
  const privateKey = getPrivateFromWallet();
  const key = EC.keyFromPrivate(privateKey, 'hex');
  return key.getPublic().encode('hex');
}

function generatePrivateKey() {
  const keyPair = EC.genKeyPair();
  const privateKey = keyPair.getPrivate();
  return privateKey.toString(16);
}

function initWallet() {
  if(existsSync(privateKeyLocation)) {
    return;
  }
  const newPrivateKey = generatePrivateKey();
  writeFileSync(privateKeyLocation, newPrivateKey);
  console.log('new wallet with private key created');
}

function getBalance(address, unspentTxOuts) {
  return _(unspentTxOuts)
    .filter(uTxO => uTxO.address === address)
    .map(uTxO => uTxO.amount)
    .sum();
}

function findTxOutsForAmount(amount, myUnspentTxOuts) {
  let currentAmount = 0;
  const includedUnspentTxOuts = [];
  for(const myUnspentTxOut of myUnspentTxOuts) {
    includedUnspentTxOuts.push(myUnspentTxOut);
    if(currentAmount >= amount) {
      const leftOverAmount = currentAmount - amount;
      return { includedUnspentTxOuts, leftOverAmount };
    }
  }
  throw Error('not enough coins to send transaction');
}

function createTxOuts(receiverAddress, myAddress, amount, leftOverAmount) {
  const txOut1 = new TxOut(receiverAddress, amount);
  if(leftOverAmount === 0) {
    return [txOut1];
  } else {
    const leftOverTx = new TxOut(myAddress, leftOverAmount);
    return [txOut1, leftOverTx];
  }
}

function toUnsignedTxIn(unspentTxOut) {
  const txIn = new TxIn();
  txIn.txOutId = unspentTxOut.txOutId;
  txIn.txOutIndex = unspentTxOut.txOutIndex;
  return txIn;
}

function createTransaction(receiverAddress, amount, privateKey, unspentTxOuts) {
  const myAddress = getPublicKey(privateKey);
  const myUnspentTxOuts = unspentTxOuts.filter(uTxO => uTxO.address === myAddress);
  const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);

  const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);

  const tx = new Transaction();
  tx.txIns = unsignedTxIns;
  tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
  tx.id = getTransactionId(tx);

  tx.txIns = tx.txIns.map((txIn, index) => {
    txIn.signature = signTxIn(tx, index, privateKey, unspentTxOuts);
    return txIn;
  });

  return tx;

}
