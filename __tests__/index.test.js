const app = require('../server/index.js')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const db = require('../db/connection.js')
const moment = require('moment')

const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/

beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  return db.end()
})

describe('General bad requests', () => {
  it('undefined endpoint', () => {
    return request(app)
      .get('/api/pigs')
      .expect(404)
  })
})

describe('GET /api/topics', () => {
  it('should return an array of objects, each having a slug and description property', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then((res) => {
        const topics = res.body.topics
        expect(topics.length).toBe(3)
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String)
          })
        })
      })
  })
})

describe('GET /api', () => {
  it('should return all available endpoints', () => {
    const actualFile = require('../endpoints.json')
    return request(app)
      .get('/api')
      .then((res) => {
        expect(() => JSON.parse(res.text)).not.toThrow(new Error)
        const endpoints = JSON.parse(res.text).endpoints
        // exception as this is actually what is requested.
        delete endpoints['GET /api']
        Object.keys(endpoints).forEach((key) => {
          expect(endpoints[key]).toMatchObject({
            description: expect.any(String),
            queries: expect.any(Array),
            exampleResponse: expect.any(Object)
          })
        })
        expect(actualFile).toEqual(JSON.parse(res.text).endpoints)
      })
  })
})

describe('GET /api/articles/:article_id', () => {
  it('should return an article by its ID', () => {
    return request(app)
      .get('/api/articles/2')
      .then((res) => {
        const article = res.body.article
        expect(article).toMatchObject({
          article_id: 2,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
          article_img_url: expect.any(String)
        })
        expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
        expect(urlPattern.test(article.article_img_url)).toBe(true)
      })
  })
  it('should return an error if article doesnt exist', () => {
    return request(app)
      .get('/api/articles/14')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('article not found')
      })
  })
  it('should return an error if article_id is invalid', () => {
    return request(app)
      .get('/api/articles/pigs')
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})

describe('GET /api/articles/:article_id (comment_count)', () => {
  it('should return an article by its ID with added comment_count', () => {
    return request(app)
      .get('/api/articles/1')
      .then((res) => {
        const article = res.body.article
        expect(article).toMatchObject({
          article_id: 1,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          votes: expect.any(Number),
          comment_count: 11,
          created_at: expect.any(String),
          article_img_url: expect.any(String)
        })
        expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
        expect(urlPattern.test(article.article_img_url)).toBe(true)
      })
  })
  it('should return an article by its ID with added comment_count as zero if no comments', () => {
    return request(app)
      .get('/api/articles/2')
      .then((res) => {
        const article = res.body.article
        expect(article).toMatchObject({
          article_id: 2,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          votes: expect.any(Number),
          comment_count: 0,
          created_at: expect.any(String),
          article_img_url: expect.any(String)
        })
        expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
        expect(urlPattern.test(article.article_img_url)).toBe(true)
      })
  })
})

describe('GET /api/articles', () => {
  it('should return an array of article objects', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        const articles = res.body.articles
        expect(Array.isArray(articles)).toBe(true)
        expect(articles.length).toBe(13)
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number)
          })
          expect(article.body).toBe(undefined)
          expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
          expect(urlPattern.test(article.article_img_url)).toBe(true)
        })
      })
  })
  it('should return an array of article objects in descending date order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then((res) => {
        const articles = res.body.articles
        const datesInMs = articles.map((article) => {
          return (new Date(article.created_at)).getTime()
        })
        expect(datesInMs).toBeSorted({ descending: true })
      })
  })
  it('should accept sort_by query', () => {
    return request(app)
      .get('/api/articles?sort_by=article_id')
      .expect(200)
      .then((res) => {
        const articles = res.body.articles
        const article_ids = articles.map((art) => {
          return art.article_id
        })
        expect(article_ids).toBeSorted({ descending: true })
      })
  })
  it('should accept order query', () => {
    return request(app)
      .get('/api/articles?order=asc')
      .expect(200)
      .then((res) => {
        const articles = res.body.articles
        const creationDates = articles.map((art) => {
          return art.created_at
        })
        expect(creationDates).toBeSorted({ descending: false })

      })
  })
})

describe('GET /api/articles (queries)', () => {
  it('should accept a topic query and returns articles only with this topic', () => {
    return request(app)
      .get('/api/articles?topic=cats')
      .expect(200)
      .then((res) => {
        const articles = res.body.articles
        expect(articles.length).toBe(1)
        articles.forEach((article) => {
          expect(article.topic).toBe('cats')
        })
      })
  })
  it('should return error if given non-existent topic', () => {
    return request(app)
      .get('/api/articles?topic=dogs')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('topic doesnt exist')
      })
  })
  it('should return nothing if given a topic with no articles referencing it', () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then((res) => {
        const article = res.body.articles
        expect(article).toEqual([])
      })
  })
  it('should accept a limit and page query. returns articles according to inputs', () => {
    return request(app)
    .get('/api/articles?limit=5&p=2')
    .expect(200)
    .then((articles) => {
      expect(articles.body.articles.length).toBe(5)
    })
  })
  it('should accept a limit and page query. returns articles according to inputs. limit should default to 10', () => {
    return request(app)
    .get('/api/articles?p=1')
    .expect(200)
    .then((articles) => {
      expect(articles.body.articles.length).toBe(10)
    })
  })
})

describe('GET /api/articles/:article_id/comments', () => {
  it('should return all comments on one article in an array', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((res) => {
        const comments = res.body.comments
        expect(Array.isArray(comments)).toBe(true)
        expect(comments.length).toBe(11)
        comments.forEach((article) => {
          expect(article).toMatchObject({
            comment_id: expect.any(Number),
            body: expect.any(String),
            votes: expect.any(Number),
            author: expect.any(String),
            article_id: 1,
            created_at: expect.any(String)
          })
          expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
        })
      })
  })
  it('should return an error if article doesnt exist', () => {
    return request(app)
      .get('/api/articles/14/comments')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('article not found')
      })
  })
  it('should return an error if article_id is invalid', () => {
    return request(app)
      .get('/api/articles/pigs/comments')
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should return an array of comment objects in descending date order', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then((res) => {
        const comments = res.body.comments
        const datesInMs = comments.map((comment) => {
          return (new Date(comment.created_at)).getTime()
        })
        expect(datesInMs).toBeSorted({ descending: true })
      })
  })
  it('should return an empty array if article exists, but no comments under it', () => {
    return request(app)
      .get('/api/articles/2/comments')
      .expect(200)
      .then((res) => {
        const comments = res.body.comments
        expect(comments).toEqual([])
      })
  })
  it('should accept a limit and page query. returns comments according to inputs', () => {
    return request(app)
    .get('/api/articles/1/comments?limit=5&p=2')
    .expect(200)
    .then((comments) => {
      expect(comments.body.comments.length).toBe(5)
    })
  })
  it('should accept a limit and page query. returns comments according to inputs. limit should default to 10', () => {
    return request(app)
    .get('/api/articles/1/comments?p=1')
    .expect(200)
    .then((comments) => {
      expect(comments.body.comments.length).toBe(10)
    })
  })
})

describe('POST /api/articles/:article_id/comments', () => {
  it('should add a comment onto an article and return the posted comment, given a valid user', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is my opinion.'
    }
    return request(app)
      .post('/api/articles/3/comments')
      .send({ newComment })
      .expect(201)
      .then((res) => {
        const comment = res.body.comment
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          body: newComment.body,
          article_id: 3,
          author: 'butter_bridge',
          votes: expect.any(Number),
          created_at: expect.any(String)
        })
        expect(moment(comment.created_at, moment.ISO_8601).isValid()).toBe(true)
      })
  })
  it('should return an error if the author of the comment is not listed in users', () => {
    const newComment = {
      username: 'Chris',
      body: 'This is my opinion.'
    }
    return request(app)
      .post('/api/articles/3/comments')
      .send({ newComment })
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('user not found')
      })
  })
  it('should return an error if the article doesnt exist', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is my opinion.'
    }
    return request(app)
      .post('/api/articles/14/comments')
      .send({ newComment })
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('article not found')
      })
  })
  it('should return an error if article_id is invalid', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is my opinion.'
    }
    return request(app)
      .post('/api/articles/doughnut/comments')
      .send({ newComment })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should return an error if new comment lacks params', () => {
    const newComment = {
      username: 'butter_bridge',
    }
    return request(app)
      .post('/api/articles/1/comments')
      .send({ newComment })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})

describe('PATCH /api/articles/:article_id', () => {
  it('should update an article by increasing/decreasing number of votes. should return the amended article. given positive change', () => {
    const modifier = {
      inc_votes: 50
    }
    const article1 = require('../db/data/test-data/articles.js')[0]
    // (this existence is indeed challenging)
    return request(app)
      .patch('/api/articles/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.article).toMatchObject({
          article_id: 1,
          title: article1.title,
          topic: article1.topic,
          author: article1.author,
          body: article1.body,
          created_at: expect.any(String),
          votes: article1.votes + modifier.inc_votes
        })
      })
  })
  it('should update an article by increasing/decreasing number of votes. should return the amended article. given negative change', () => {
    const modifier = {
      inc_votes: -50
    }
    const article1 = require('../db/data/test-data/articles.js')[0]
    // (this existence is indeed challenging)
    return request(app)
      .patch('/api/articles/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.article).toMatchObject({
          article_id: 1,
          title: article1.title,
          topic: article1.topic,
          author: article1.author,
          body: article1.body,
          created_at: expect.any(String),
          votes: article1.votes + modifier.inc_votes
        })
      })
  })
  it('should return error if article_id doesnt exist', () => {
    const modifier = {
      inc_votes: 50
    }
    return request(app)
      .patch('/api/articles/14')
      .send({ modifier })
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('article not found')
      })
  })
  it('should return error if article_id is invalid', () => {
    const modifier = {
      inc_votes: 50
    }
    return request(app)
      .patch('/api/articles/cheese')
      .send({ modifier })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should return error if given non number inc_votes', () => {
    const modifier = {
      inc_votes: "fake number"
    }
    return request(app)
      .patch('/api/articles/cheese')
      .send({ modifier })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('inc_votes must be a number')
      })
  })
  it('should return original article if modifier lacks params', () => {
    const article1 = require('../db/data/test-data/articles.js')[0]
    const modifier = {
      laugh: -50
    }
    return request(app)
      .patch('/api/articles/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.article).toMatchObject({
          article_id: 1,
          title: article1.title,
          topic: article1.topic,
          author: article1.author,
          body: article1.body,
          created_at: expect.any(String),
          votes: article1.votes
        })
      })
  })
})

describe('DELETE /api/comments/:comment_id', () => {
  it('should delete a comment given its id', () => {
    return request(app)
      .delete('/api/comments/10')
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({})
      })
  })
  it('should return an error if comment doesnt exist', () => {
    return request(app)
      .delete('/api/comments/20')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('comment not found')
      })
  })
  it('should return an error if comment_id is invalid', () => {
    return request(app)
      .delete('/api/comments/bananas')
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})

describe('GET /api/users', () => {
  it('should return an array of all users', () => {
    const actualUsers = require('../db/data/test-data/users.js')
    return request(app)
      .get('/api/users')
      .expect(200)
      .then((res) => {
        const users = res.body.users
        expect(users.length).toBe(actualUsers.length)
        users.forEach((user, i) => {
          expect(user).toMatchObject({
            username: actualUsers[i].username,
            name: actualUsers[i].name,
            avatar_url: actualUsers[i].avatar_url
          })
        })
      })
  })
})

describe('GET /api/users/:username', () => {
  it('should return a username object', () => {
    return request(app)
      .get('/api/users/butter_bridge')
      .expect(200)
      .then((res) => {
        expect(res.body.user).toEqual({
          username: 'butter_bridge',
          name: 'jonny',
          avatar_url:
            'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
        })
      })
  })
  it('should return error if user doesnt exist', () => {
    return request(app)
      .get('/api/users/unknown')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('user not found')
      })
  })
})

describe('PATCH /api/comments/:comment_id', () => {
  it('should update a comment by increasing/decreasing number of votes. should return the amended article. given positive change', () => {
    const modifier = {
      inc_votes: 50
    }
    const comment1 = require('../db/data/test-data/comments.js')[0]
    // (this existence is indeed challenging)
    return request(app)
      .patch('/api/comments/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          comment_id: 1,
          author: comment1.author,
          body: comment1.body,
          created_at: expect.any(String),
          votes: comment1.votes + modifier.inc_votes
        })
      })
  })
  it('should update a comment by increasing/decreasing number of votes. should return the amended article. given negative change', () => {
    const modifier = {
      inc_votes: -50
    }
    const comment1 = require('../db/data/test-data/comments.js')[0]
    // (this existence is indeed challenging)
    return request(app)
      .patch('/api/comments/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          comment_id: 1,
          author: comment1.author,
          body: comment1.body,
          created_at: expect.any(String),
          votes: comment1.votes + modifier.inc_votes
        })
      })
  })
  it('should return error if comment_id doesnt exist', () => {
    const modifier = {
      inc_votes: 50
    }
    return request(app)
      .patch('/api/comments/1000')
      .send({ modifier })
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('comment not found')
      })
  })
  it('should return error if comment_id is invalid', () => {
    const modifier = {
      inc_votes: 50
    }
    return request(app)
      .patch('/api/comments/cheese')
      .send({ modifier })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should return error if given non number inc_votes', () => {
    const modifier = {
      inc_votes: "fake number"
    }
    return request(app)
      .patch('/api/comments/cheese')
      .send({ modifier })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('inc_votes must be a number')
      })
  })
  it('should return original comment if modifier lacks params', () => {
    const comment1 = require('../db/data/test-data/comments.js')[0]
    const modifier = {
      laugh: -50
    }
    return request(app)
      .patch('/api/comments/1')
      .send({ modifier })
      .expect(200)
      .then((res) => {
        expect(res.body.comment).toMatchObject({
          comment_id: 1,
          author: comment1.author,
          body: comment1.body,
          created_at: expect.any(String),
          votes: comment1.votes
        })
      })
  })
})
describe('POST /api/articles', () => {
  it('should post a new article, and return that same article with an initialised comment count', () => {
    const newArticle = {
      title: "Can I go to Japan",
      topic: "cats",
      author: "butter_bridge",
      body: "I want to go to cat island",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }
    return request(app)
      .post('/api/articles')
      .send({ newArticle })
      .expect(201)
      .then((addedArticle) => {
        expect(addedArticle.body.addedArticle).toMatchObject({
          title: "Can I go to Japan",
          topic: "cats",
          author: "butter_bridge",
          body: "I want to go to cat island",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: 0
        })
      })
  })
  it('should return an error if invalid author', () => {
    const newArticle = {
      title: "Can I go to Japan",
      topic: "cats",
      author: "author",
      body: "I want to go to cat island",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }
    return request(app)
      .post('/api/articles')
      .send({ newArticle })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should return an error if invalid topic', () => {
    const newArticle = {
      title: "Can I go to Japan",
      topic: "dogs",
      author: "butter_bridge",
      body: "I want to go to cat island",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }
    return request(app)
      .post('/api/articles')
      .send({ newArticle })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
  it('should post a new article, and return that same article with an initialised comment count, with default url if not given url', () => {
    const newArticle = {
      title: "Can I go to Japan",
      topic: "cats",
      author: "butter_bridge",
      body: "I want to go to cat island"
    }
    return request(app)
      .post('/api/articles')
      .send({ newArticle })
      .expect(201)
      .then((addedArticle) => {
        expect(addedArticle.body.addedArticle).toMatchObject({
          title: "Can I go to Japan",
          topic: "cats",
          author: "butter_bridge",
          body: "I want to go to cat island",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          comment_count: 0
        })
      })
  })
  it('should return an error if missing params', () => {
    const newArticle = {
      title: "Can I go to Japan",
      topic: "dogs",
      author: "butter_bridge",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
    }
    return request(app)
      .post('/api/articles')
      .send({ newArticle })
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})
describe('POST /api/topics', () => {
  it('should add a new topic and send it back', () => {
    const newTopic = {
      slug: "life",
      description: "thoughts about traversing life and life itself"
    }
    return request(app)
    .post('/api/topics')
    .send({newTopic})
    .expect(201)
    .then((addedTopic) => {
      expect(addedTopic.body.addedTopic).toEqual(newTopic)
    })
  })
  it('should return error if missing params', () => {
    const newTopic = {
      slug: "life",
    }
    return request(app)
    .post('/api/topics')
    .send({newTopic})
    .expect(400)
    .then((err) => {
      expect(err.body.msg).toBe('bad request')
    })
  })
  it('extra params are ignored.', () => {
    const newTopic = {
      slug: "life",
      description: "thoughts about traversing life and life itself",
      extraNotNeededProp: "wand"
    }
    return request(app)
    .post('/api/topics')
    .send({newTopic})
    .expect(201)
    .then((addedTopic) => {
      expect(addedTopic.body.addedTopic).toEqual({
        slug: "life",
        description: "thoughts about traversing life and life itself"
      })
    })
  })
})
describe('DELETE /api/articles/:article_id', () => {
  it('should delete an article according to the supplied article id', () => {
    return request(app)
      .delete('/api/articles/1')
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({})
      })
  })
  it('should return an error if article doesnt exist', () => {
    return request(app)
      .delete('/api/articles/14')
      .expect(404)
      .then((err) => {
        expect(err.body.msg).toBe('article not found')
      })
  })
  it('should return an error if article_id is invalid', () => {
    return request(app)
      .delete('/api/articles/pigs')
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})