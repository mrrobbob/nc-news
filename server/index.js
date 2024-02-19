const express = require('express')
const app = express()

const {getTopics, getEndpoints} = require('./index.controller.js')

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.use((err, req, res, next) => {
  if (err) {
    res.status(err.status).send({msg: err.msg})
  }
})

module.exports = app