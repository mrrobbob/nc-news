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
  ;
  return db.query(strQuery, [articleId])
}

module.exports = {selectTopics, selectArticleById}