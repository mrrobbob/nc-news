const articlesRouter = require('express').Router()

const {getArticleById, getArticles, deleteArticleById, postArticle,  getArticleComments, postComment, patchArticleById} = require('../index.controller.js')

articlesRouter.get('/', getArticles)

articlesRouter.post('/', postArticle)

articlesRouter
.route('/:article_id')
.get(getArticleById)
.patch(patchArticleById)
.delete(deleteArticleById)

articlesRouter
.route('/:article_id/comments')
.get(getArticleComments)
.post(postComment)

module.exports = articlesRouter