const db = require('../db/connection.js')

function selectTopics () {
  let strQuery = `
  SELECT * FROM topics
  `
  return db.query(strQuery)
}

async function insertTopic (newTopic) {
  const {slug, description} = newTopic
  if (!(slug && description)) {
    return Promise.reject({status: 400, msg: 'bad request'})
  }
  const insertionParams = [slug, description]
  const insertedTopic = await db.query(`
  INSERT INTO topics
  (slug, description)
  VALUES
  ($1, $2)
  RETURNING *
  `, insertionParams)

  return insertedTopic
}

function selectArticleById (articleId) {
  let strQuery = `
  SELECT J.* FROM
  (SELECT articles.*, COUNT(comments.article_id) as comment_count
  FROM comments
  RIGHT JOIN articles ON articles.article_id = comments.article_id GROUP BY articles.article_id) J
  WHERE J.article_id = $1
  `
  return db.query(strQuery, [articleId])
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" })
      }
      article.rows[0].comment_count = Number(article.rows[0].comment_count)
      return article.rows[0]
    })
}

async function selectArticles (query) {
  let strQuery = `
  SELECT article_id, title, topic, author, created_at, votes, article_img_url FROM articles
  `
  if (query.topic) {
    const topicTrial = await db.query(`
    SELECT * FROM topics
    WHERE slug = '${query.topic}'
    `)
    if (topicTrial.rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'topic doesnt exist' })
    }
    strQuery += `\nWHERE topic = '${query.topic}'`
  }

  if (query.sort_by) {
    const validCategories = ['article_id', 'title', 'topic', 'author', 'created_at', 'votes',]
    if (validCategories.includes(query.sort_by)) {
      strQuery += `\nORDER BY ${query.sort_by}`
    }
  }
  else {
    strQuery += `\nORDER BY created_at`
  }

  if (query.order) {
    if (query.order === 'ASC' || query.order === 'DESC') {
      strQuery += ` ${query.order}`
    }
  }
  else {
    strQuery += ` DESC`
  }

  if (query.p) {
    let limit = query.limit
    if (!limit) {
      limit = 10
    }
    const offset = (query.p - 1) * limit + 1
    strQuery += ` OFFSET ${offset} LIMIT ${limit}`
  }

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

async function insertArticle (newArticle) {
  let {title, topic, author, body, article_img_url} = newArticle
  if (!(title && topic && author && body)) {
    return Promise.reject({status: 400, msg: 'bad request'})
  }
  if (!article_img_url) {
    article_img_url = "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
  }
  const insertionParams = [title, topic, author, body, article_img_url]
  const insertedArticle = await db.query(`
    INSERT INTO articles
    (title, topic, author, body, article_img_url)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `, insertionParams)

  insertedArticle.rows[0].comment_count = 0
  return insertedArticle
}

async function selectArticleComments (query, articleId) {
  let strQuery = `
  SELECT comment_id, body, votes, author, article_id, created_at FROM comments
  WHERE article_id = $1
  ORDER BY created_at DESC
  `
  if (!/^-?\d+$/.test(Number(articleId))) {
    return Promise.reject({ status: 400, msg: 'bad request' })
  }

  const articleTrial = await db.query(`
  SELECT article_id
  FROM articles
  WHERE article_id = $1
  `, [articleId])

  if (articleTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'article not found' })
  }

  if (query.p) {
    let limit = query.limit
    if (!limit) {
      limit = 10
    }
    const offset = (query.p - 1) * limit + 1
    strQuery += ` OFFSET ${offset} LIMIT ${limit}`
  }

  return db.query(strQuery, [articleId])
}

async function insertComment (articleId, newComment) {
  const { username, body } = newComment

  if (!(username && body)) {
    return Promise.reject({ status: 400, msg: 'bad request' })
  }

  const userTrial = await db.query(`
  SELECT * FROM users
  WHERE username = $1
  `, [username])

  if (userTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'user not found' })
  }

  if (!/^-?\d+$/.test(Number(articleId))) {
    return Promise.reject({ status: 400, msg: 'bad request' })
  }

  const articleTrial = await db.query(`
  SELECT article_id
  FROM articles
  WHERE article_id = $1
  `, [articleId])

  if (articleTrial.rows.length === 0) {
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

async function updateArticle (articleId, { inc_votes }) {
  if (!inc_votes) {
    inc_votes = 0
  }

  if (typeof inc_votes !== 'number') {
    return Promise.reject({ status: 400, msg: 'inc_votes must be a number' })
  }

  let strQuery = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *
  `
  const articleTrial = await db.query(`
  SELECT article_id
  FROM articles
  WHERE article_id = $1
  `, [articleId])

  if (articleTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'article not found' })
  }

  return db.query(strQuery, [inc_votes, articleId])
}

async function updateComment (commentId, {inc_votes}) {
  if (!inc_votes) {
    inc_votes = 0
  }

  if (typeof inc_votes !== 'number') {
    return Promise.reject({ status: 400, msg: 'inc_votes must be a number' })
  }

  let strQuery = `
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *
  `
  const commentTrial = await db.query(`
  SELECT comment_id
  FROM comments
  WHERE comment_id = $1
  `, [commentId])

  if (commentTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'comment not found' })
  }

  return db.query(strQuery, [inc_votes, commentId])
}

async function removeComment (commentId) {
  const commentTrial = await db.query(`
  SELECT comment_id
  FROM comments
  WHERE comment_id = $1
  `, [commentId])

  if (commentTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'comment not found' })
  }

  let strQuery = `
  DELETE FROM comments
  WHERE comment_id = $1
  `
  return db.query(strQuery, [commentId])
}

function selectUsers () {
  let strQuery = `
  SELECT * FROM users
  `
  return db.query(strQuery)
}

async function selectUserByUsername (username) {
  const user = await db.query(`
  SELECT * FROM users
  WHERE username = $1
  `, [username])
  if (user.rows.length === 0) {
    return Promise.reject({status: 404, msg: 'user not found'})
  }
  return user
}

async function removeArticle (articleId) {
  const articleTrial = await db.query(`
  SELECT article_id
  FROM articles
  WHERE article_id = $1
  `, [articleId])

  if (articleTrial.rows.length === 0) {
    return Promise.reject({ status: 404, msg: 'article not found' })
  }

  let strQuery = `
  DELETE FROM articles
  WHERE article_id = $1
  `
  return db.query(strQuery, [articleId])
}

module.exports = { selectTopics, insertTopic, selectArticleById, selectArticles, insertArticle, selectArticleComments, insertComment, updateArticle, updateComment, removeComment, selectUsers, selectUserByUsername, removeArticle }