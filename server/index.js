const express = require('express')
const apiRouter = require('./routes/api-router.js')
const app = express()

app.use(express.json())

app.use('/api', apiRouter)

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({msg: 'bad request'})
  }
  if (err.code === '23503') { // foreign key violation
    res.status(400).send({msg: 'bad request'})
  }
  res.status(err.status).send({msg: err.msg})
})

module.exports = app