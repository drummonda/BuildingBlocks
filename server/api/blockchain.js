const router = require('express').Router()
const { getState, generateNextBlock } = require('../blockchain')

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
router.post('/mineBlock', (req, res, next) => {
  try {
    const { blockData } = req.body;
    const newBlock = generateNextBlock(blockData);
    res.json(newBlock);
  } catch (err) {
    next(err);
  }
})
