const {selectTopics, selectArticleById, selectArticles, selectArticleComments, insertComment} = require('./index.model.js')

const db = require('../db/connection.js')

function getTopics (req, res, next) {
  selectTopics()
  .then((topics) => {
    res.status(200).send({topics: topics.rows})
  })
  .catch((err) => {
    next(err)
  })
}

function getEndpoints (req, res, next) {
  const endpoints = require('../endpoints.json')
  res.status(200).send({endpoints})
}

function getArticleById (req, res, next) {
  const articleId = req.params.article_id
  selectArticleById(articleId)
  .then((article) => {
    res.status(200).send({article: article.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

function getArticles (req, res, next) {
  selectArticles()
  .then((articles) => {
    res.status(200).send({articles})
  })
  .catch((err) => {
    next(err)
  })
}

function getArticleComments (req, res, next) {
  const articleId = req.params.article_id
  selectArticleComments(articleId)
  .then((comments) => {
    res.status(200).send({comments: comments.rows})
  })
  .catch((err) => {
    next(err)
  })
}

function postComment (req, res, next) {
  const articleId = req.params.article_id
  const {newComment} = req.body
  insertComment(articleId, newComment)
  .then((comment) => {
    res.status(201).send({comment: comment.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

module.exports = {getTopics, getEndpoints, getArticleById, getArticles, getArticleComments, postComment}