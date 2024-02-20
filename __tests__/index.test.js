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
      expect(datesInMs).toBeSorted({descending: true})
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
        expect(err.body.msg).toBe('article doesnt exist')
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
      expect(datesInMs).toBeSorted({descending: true})
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
})

describe('POST /api/articles/:article_id/comments', () => {
  it('should add a comment onto an article and return the posted comment, given a valid user', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is my opinion.'
    }
    return request(app)
    .post('/api/articles/3/comments')
    .send({newComment})
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
    .send({newComment})
    .expect(400)
    .then((err) => {
      expect(err.body.msg).toBe('user doesnt exist')
    })
  })
  it('should return an error if the article doesnt exist', () => {
    const newComment = {
      username: 'butter_bridge',
      body: 'This is my opinion.'
    }
    return request(app)
      .post('/api/articles/14/comments')
      .send({newComment})
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
      .send({newComment})
      .expect(400)
      .then((err) => {
        expect(err.body.msg).toBe('bad request')
      })
  })
})