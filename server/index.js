const express = require('express')
const app = express()

const {getTopics} = require('./index.controller.js')

app.use(express.json())

app.get('/api/topics', getTopics)

app.use((err, req, res, next) => {
  if (err) {
    res.status(err.status).send({msg: err.msg})
  }
})

module.exports = app