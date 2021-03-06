const path = require('path')
const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const PORT = process.env.PORT || 8080;
const P2P = 6001;
const app = express();
const socketio = require('socket.io');
const { initWallet, getPrivateFromWallet, getPublicFromWallet } = require('./blockchain/wallet');
const { generateNextBlockWithTransaction } = require('./blockchain');
module.exports = app

/**
 * In your development environment, you can keep all of your
 * app's secret API keys in a file called `secrets.js`, in your project
 * root. This file is included in the .gitignore - it will NOT be tracked
 * or show up on Github. On your production server, you can add these
 * keys as environment variables, so that they can still be read by the
 * Node process on process.env
 */
if (process.env.NODE_ENV !== 'production') require('../secrets')

const createApp = () => {
  // logging middleware
  app.use(morgan('dev'))

  // body parsing middleware
  app.use(express.json())
  app.use(express.urlencoded({extended: true}))

  // compression middleware
  app.use(compression())

  // access request
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  // api routes
  app.use('/api', require('./api'))

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, '..', 'public')))

  // any remaining requests with an extension (.js, .css, etc.) send 404
  app.use((req, res, next) => {
    if (path.extname(req.path).length) {
      console.log(req);
      const err = new Error('Not found')
      err.status = 404
      next(err)
    } else {
      next()
    }
  })

  // sends index.html
  app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public/index.html'))
  })

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  })
}

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  const { initServer, initP2PServer, initAutoMining } = require('./socket');
  const server = app.listen(PORT, () => {
    console.log(`Mixing it up on port ${PORT}`);
  });


  const io = socketio(server);
  initServer(io);
  initP2PServer(P2P);
  initAutoMining();
}

async function bootApp() {
  await createApp();
  await startListening();
  initWallet();
  generateNextBlockWithTransaction('049955b07f3dcbd257f704432cd7bc89162a01c74857cd1499e572b7231c578a469603aea106397cfb632bb61bf40e8ecc297839eda676caa58ce52c501809c7d2', getPublicFromWallet(), getPrivateFromWallet(), 20);
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp();
} else {
  createApp()
}
