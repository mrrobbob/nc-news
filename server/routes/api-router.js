const apiRouter = require('express').Router()
const articlesRouter = require('./articles-router.js')

const {getTopics, getEndpoints, getUsers, postTopic, getUserByUsername, patchCommentById, deleteCommentById} = require('../index.controller.js')

apiRouter.use('/articles', articlesRouter)

apiRouter.get('/', getEndpoints)

apiRouter.get('/topics', getTopics)

apiRouter.post('/topics', postTopic)

apiRouter.get('/users', getUsers)

apiRouter.get('/users/:username', getUserByUsername)

apiRouter.patch('/comments/:comment_id', patchCommentById)

apiRouter.delete('/comments/:comment_id', deleteCommentById)

module.exports = apiRouter