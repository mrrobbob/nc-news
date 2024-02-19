const app = require('../server/index.js')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const db = require('../db/connection.js')

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
    })
  })
})

describe('GET /api/articles/:article_id', () => {
  it('should return an article by its ID', () => {
    return request(app)
    .get('/api/articles/2')
    .then((res) => {
      const article = res.body.article
    })
  })
})