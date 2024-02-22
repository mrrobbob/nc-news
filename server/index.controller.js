const {selectTopics, insertTopic, selectArticleById, selectArticles, insertArticle, selectArticleComments, insertComment, updateArticle, updateComment, removeComment, selectUsers, selectUserByUsername, removeArticle} = require('./index.model.js')

function getTopics (req, res, next) {
  selectTopics()
  .then((topics) => {
    res.status(200).send({topics: topics.rows})
  })
  .catch((err) => {
    next(err)
  })
}

function postTopic (req, res, next) {
  const {newTopic} = req.body
  insertTopic(newTopic)
  .then((addedTopic) => {
    res.status(201).send({addedTopic: addedTopic.rows[0]})
  })
  .catch((err) => {
    console.log(err);
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
    res.status(200).send({article})
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

function postArticle (req, res, next) {
  const {newArticle} = req.body
  insertArticle(newArticle)
  .then((article) => {
    res.status(201).send({addedArticle: article.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

function getArticleComments (req, res, next) {
  const query = req.query
  const articleId = req.params.article_id
  selectArticleComments(query, articleId)
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

function patchCommentById (req, res, next) {
  const commentId = req.params.comment_id
  const {modifier} = req.body
  updateComment(commentId, modifier)
  .then((comment) => {
    res.status(200).send({comment: comment.rows[0]})
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

function getUserByUsername (req, res, next) {
  const username = req.params.username
  selectUserByUsername(username)
  .then((user) => {
    res.status(200).send({user: user.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

function deleteArticleById (req, res, next) {
  const articleId = req.params.article_id
  removeArticle(articleId)
  .then(() => {
    res.status(204).end()
  })
  .catch((err) => {
    next(err)
  })
}

module.exports = {getTopics, postTopic, getEndpoints, getArticleById, getArticles, deleteArticleById, postArticle, getArticleComments, postComment, patchArticleById, patchCommentById, deleteCommentById, getUsers, getUserByUsername}