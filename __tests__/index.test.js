const app = require('../server/index.js')
const request = require('supertest')
const seed = require('../db/seeds/seed.js')
const data = require('../db/data/test-data')
const db = require('../db/connection.js')

beforeEach(() => {
  return seed(data)
})

afterAll(() => {
  db.end()
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