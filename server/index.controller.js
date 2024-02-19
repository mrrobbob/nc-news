const {selectTopics, selectArticleById} = require('./index.model.js')

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
    if (article.rows.length === 0) {
      next({status: 404, msg: "not found"})
    }
    res.status(200).send({article: article.rows})
  })
  .catch((err) => {
    next(err)
  })
}

module.exports = {getTopics, getEndpoints, getArticleById}