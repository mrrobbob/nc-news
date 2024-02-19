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
        expect(err.body.msg).toBe('not found')
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
        })
        expect(article.body).toBe(undefined)
        expect(moment(article.created_at, moment.ISO_8601).isValid()).toBe(true)
        expect(urlPattern.test(article.article_img_url)).toBe(true)
      })
    })
  })
  it('should return an array of article objects in descending order', () => {
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