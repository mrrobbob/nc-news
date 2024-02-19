const {selectTopics} = require('./index.model.js')

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

module.exports = {getTopics, getEndpoints}