const router = require('express').Router()
module.exports = router

router.use('/peers', require('./peers'))
router.use('/blockchain', require('./blockchain'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
