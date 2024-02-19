const db = require('../db/connection.js')
const format = require('pg-format')

function selectTopics() {
  let strQuery = `
  SELECT * FROM topics
  `
  return db.query(strQuery)
}

function selectArticleById(articleId) {
  let strQuery = `
  SELECT * FROM articles
  WHERE article_id = $1
  `
  return db.query(strQuery, [articleId])
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" })
      }
      return article
    })
}

function selectArticles() {
  let strQuery = `
  SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles
  ORDER BY created_at DESC
  `
  return db.query(strQuery)
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
    return preppedArticles
  })
}

async function selectArticleComments(articleId) {
  let strQuery = `
  SELECT comment_id, body, votes, author, article_id, created_at FROM comments
  WHERE article_id = $1
  ORDER BY created_at DESC
  `
  const existingArticles = await db.query(`
    SELECT article_id
    FROM articles
    `)
  const articleIds = existingArticles.rows.map((obj) => {
    return obj.article_id
  })

  if (!/^-?\d+$/.test(Number(articleId))) {
    return Promise.reject({ status: 400, msg: 'bad request' })
  }

  if (!articleIds.includes(Number(articleId))) {
    return Promise.reject({ status: 404, msg: 'article doesnt exist' })
  }

  return db.query(strQuery, [articleId])
}

async function insertComment(articleId, newComment) {
  const usernames = await db.query(`
  SELECT username FROM users
  `)
  
  let validUsernames = usernames.rows
  validUsernames = validUsernames.map((obj) => {
    return obj.username
  })
  const { username, body } = newComment

  if (!validUsernames.includes(username)) {
    return Promise.reject({ status: 400, msg: 'user doesnt exist' })
  }
  
  const existingArticles = await db.query(`
    SELECT article_id
    FROM articles
  `)

  const articleIds = existingArticles.rows.map((obj) => {
    return obj.article_id
  })

  if (!/^-?\d+$/.test(Number(articleId))) {
    return Promise.reject({ status: 400, msg: 'bad request' })
  }

  if (!articleIds.includes(Number(articleId))) {
    return Promise.reject({ status: 404, msg: 'article not found' })
  }

  const insertionParams = [username, body, Number(articleId)]
  let strQuery = `
    INSERT INTO comments
    (author, body, article_id)
    VALUES
    ($1, $2, $3)
    RETURNING *
    `

  return db.query(strQuery, insertionParams)
}

module.exports = { selectTopics, selectArticleById, selectArticles, selectArticleComments, insertComment }