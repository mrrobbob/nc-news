const {selectTopics, selectArticleById, selectArticles} = require('./index.model.js')

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
    if (article.rows.length === 0) {
      next({status: 404, msg: "not found"})
    }
    res.status(200).send({article: article.rows[0]})
  })
  .catch((err) => {
    next(err)
  })
}

function getArticles (req, res, next) {
  selectArticles()
  .then(async (articles) => {
    const noBody = articles.rows.map((article) => {
      delete article.body
      return article
    })
    const counts = await db.query(`
    SELECT article_id, COUNT(*) as count
    FROM comments
    GROUP BY article_id
    `)
    const preppedArticles = noBody.map((article) => {
      const copyArticle = JSON.parse(JSON.stringify(article))
      for (const key of counts.rows) {
        if (copyArticle.article_id === key.article_id) {
          copyArticle.comment_count = Number(key.count)
          return copyArticle
        }
        else {
          copyArticle.comment_count = 0
          return copyArticle
        }
      }
    })
    res.status(200).send({articles: preppedArticles})
  })
}

module.exports = {getTopics, getEndpoints, getArticleById, getArticles}