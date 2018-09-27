const router = require('express').Router()
const {
  getState,
  generateNextBlock,
  generateRawNextBlock,
  getAccountBalance,
  generateNextBlockWithTransaction,
  sendTransaction,
  makeTransaction,
  addTransaction
} = require('../blockchain');

module.exports = router

// Method for retrieving the current state of the blockchain
router.get('/', (req, res, next) => {
  try {
    const blockchain = getState();
    res.json(blockchain);
  } catch (err) {
    next(err)
  }
});

// Method for grabbing a user's account balance
router.get('/balance', (req, res, next) => {
  try {
    const { address } = req.headers;
    const balance = getAccountBalance(address);
    res.send(balance);
  } catch (err) {
    next(err);
  }
})

// Method for adding a new raw block to the blockchain
router.post('/mineRawBlock', (req, res, next) => {
  try {
    if(!req.body) {
      res.send('data parameter is missing');
      return;
    }
    const { blockData } = req.body;
    const newBlockchain = generateRawNextBlock(blockData);
    if(!newBlockchain) {
      res.status(400).send('could not generate block');
    } else {
      res.json(newBlockchain);
    }
  } catch (err) {
    next(err);
  }
})

// Method for adding a new block to the blockchain
router.post('/mineBlock', (req, res, next) => {
  try {
    const newBlockchain = generateNextBlock();
    if(!newBlockchain) {
      res.status(400).send('could not generate block');
    } else {
      res.json(newBlockchain);
    }
  } catch (err) {
    next(err);
  }
})

// Method for mining a transaction
router.post('/mineTransaction', (req, res, next) => {
  try {
    const address = req.body.address;
    const amount = req.body.amount;
    const resp = generateNextBlockWithTransaction(address, amount);
    res.send(resp);
  } catch (err) {
    next(err);
  }
})

router.post('/sendTransaction', (req, res, next) => {
  try {
    const { receiverAddress, senderAddress, amount, signature } = req.body;
    if(receiverAddress === undefined || amount === undefined) {
      throw new Error('invalid address, amount');
    }
    const resp = sendTransaction(receiverAddress, senderAddress, amount, signature);
    res.send(resp);
  } catch (err) {
    next(err);
  }
})

router.post('/proposeTransaction', (req, res, next) => {
  try {
    const { receiverAddress , senderAddress, amount } = req.body;
    if(receiverAddress === undefined || amount === undefined) {
      throw new Error('invalid address, amount');
    }
    const unsignedTx = makeTransaction(receiverAddress, senderAddress, amount);
    res.send(unsignedTx);
  } catch (err) {
    next(err);
  }
})

router.post('/signedTransaction', (req, res, next) => {
  try {
    const { tx } = req.body;
    const addedTx = addTransaction(tx);
    res.send(addedTx);
  } catch (err) {
    next(err);
  }
})
