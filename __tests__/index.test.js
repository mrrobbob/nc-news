const app = require('../server/index.js')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const db = require('../db/connection.js')
const moment = require('moment')

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
    const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/
    return request(app)
      .get('/api/articles/2')
      .then((res) => {
        const article = res.body.article
        expect(article.length).toBe(1)

        expect(article[0]).toMatchObject({
          article_id: 2,
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
          article_img_url: expect.any(String)
        })
        expect(moment(article[0].created_at, moment.ISO_8601).isValid()).toBe(true)
        expect(urlPattern.test(article[0].article_img_url)).toBe(true)
      })
  })
  it('should return an error if article doesnt exist', () => {
    return request(app)
      .get('/api/articles/14')
      .expect(404)
  })
})