const {selectTopics, selectArticleById, selectArticles, selectArticleComments} = require('./index.model.js')

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
  .then(async (articles) => {
    const noBody = articles.rows
    const counts = await db.query(`
    SELECT article_id, COUNT(*) as count
    FROM comments
    GROUP BY article_id
    `)
    const preppedArticles = noBody.map((article) => {
      for (const key of counts.rows) {
        if (article.article_id === key.article_id) {
          article.comment_count = Number(key.count)
          return article
        }
        else {
          article.comment_count = 0
          return article
        }
      }
    })
    res.status(200).send({articles: preppedArticles})
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

module.exports = {getTopics, getEndpoints, getArticleById, getArticles, getArticleComments}