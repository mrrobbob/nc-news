const express = require('express')
const app = express()

const {getTopics, getEndpoints, getArticleById, getArticles} = require('./index.controller.js')

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticleById)

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({msg: 'bad request'})
  }
  res.status(err.status).send({msg: err.msg})
})

module.exports = app