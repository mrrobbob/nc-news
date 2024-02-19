const {selectTopics, selectArticleById, selectArticles, selectArticleComments, insertComment, updateArticle, removeComment, selectUsers} = require('./index.model.js')

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
  const query = req.query
  selectArticles(query)
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

function patchArticleById (req, res, next) {
  const articleId = req.params.article_id
  const {modifier} = req.body
  updateArticle(articleId, modifier)
  .then((article) => {
    res.status(200).send({article: article.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

function deleteCommentById (req, res, next) {
  const commentId = req.params.comment_id
  removeComment(commentId)
  .then(() => {
    res.status(204).end()
  })
  .catch((err) => {
    next(err)
  })
}

function getUsers (req, res, next) {
  selectUsers()
  .then((users) => {
    res.status(200).send({users: users.rows})
  })
  .catch((err) => {
    next(err)
  })
}

module.exports = {getTopics, getEndpoints, getArticleById, getArticles, getArticleComments, postComment, patchArticleById, deleteCommentById, getUsers}