const router = require('express').Router()
const { connectToPeers, getSockets } = require('../socket');
module.exports = router

// Get the current state of the p2p server
router.get('/', (req, res) => {
  const sockets = getSockets();
  const response = { nodes: sockets.length }
  res.json(response);
});

// Adding a new peer to the p2p network
router.post('/addPeer', (req, res) => {
  connectToPeers(req.body.peer);
  res.send();
});
