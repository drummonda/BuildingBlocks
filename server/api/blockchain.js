const router = require('express').Router()
const { getState, addBlock, generateNextBlock } = require('../blockchain')
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

// Method for adding a new block to the blockchain
router.post('/', (req, res, next) => {
  try {
    const { blockData } = req.body;
    const newBlock = generateNextBlock(blockData);
    const newBlockchain = addBlock(newBlock);
    res.json(newBlockchain);
  } catch (err) {
    next(err);
  }
})
