const router = require('express').Router()
const { connectToPeers, getPeers } = require('../socket');
module.exports = router

// Get the current state of the p2p server
router.get('/peers', (req, res) => {
  res.send(getPeers());
});

// Adding a new peer to the p2p network
router.post('/addPeer', (req, res) => {
  connectToPeers([req.body.peer]);
  res.send();
});
