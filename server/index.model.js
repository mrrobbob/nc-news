const db = require('../db/connection.js')
const format = require('pg-format')

function selectTopics () {
  let strQuery = `
  SELECT * FROM topics
  `
  return db.query(strQuery)
}

function selectArticleById (articleId) {
  let strQuery = `
  SELECT * FROM articles
  WHERE article_id = $1
  `
  return db.query(strQuery, [articleId])
  .then((article) => {
    if (article.rows.length === 0) {
      return Promise.reject({status: 404, msg: "article not found"})
    }
    return article
  })
}

function selectArticles () {
  let strQuery = `
  SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles
  ORDER BY created_at DESC
  `
  return db.query(strQuery)
}

function selectArticleComments (articleId) {
  let strQuery = `
  SELECT comment_id, body, votes, author, article_id, created_at FROM comments
  WHERE article_id = $1
  ORDER BY created_at DESC
  `
  return db.query(strQuery, [articleId])
  .then((comments) => {
    if (comments.rows.length === 0) {
      return Promise.reject({status: 404, msg: 'no comments under this article'})
    }
    return comments
  })
}

module.exports = {selectTopics, selectArticleById, selectArticles, selectArticleComments}