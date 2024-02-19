const db = require('../db/connection.js')
const format = require('pg-format')

function selectTopics() {
  let strQuery = `
  SELECT * FROM topics
  `
  return db.query(strQuery)
}

module.exports = {selectTopics}