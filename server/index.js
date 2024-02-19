const express = require('express')
const app = express()

const {getTopics, getEndpoints, getArticleById, getArticles, getArticleComments, postComment, patchArticleById, deleteCommentById} = require('./index.controller.js')

app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getArticleComments)

app.post('/api/articles/:article_id/comments', postComment)

app.patch('/api/articles/:article_id', patchArticleById)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.use((err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({msg: 'bad request'})
  }
  res.status(err.status).send({msg: err.msg})
})

module.exports = app