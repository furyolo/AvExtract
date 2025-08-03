import { test } from 'tap'
import { build } from '../helper'

test('movies API endpoints', async (t) => {
  const app = await build(t)

  // Test root endpoint
  t.test('GET /', async (t) => {
    const res = await app.inject({
      url: '/'
    })
    t.equal(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    t.equal(payload.name, 'AV Movies API')
  })

  // Test health endpoint
  t.test('GET /health', async (t) => {
    const res = await app.inject({
      url: '/health'
    })
    t.equal(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    t.equal(payload.status, 'healthy')
  })

  // Test get all movies (empty initially)
  t.test('GET /movies', async (t) => {
    const res = await app.inject({
      url: '/movies'
    })
    t.equal(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    t.equal(payload.success, true)
    t.type(payload.data, 'object')
  })

  // Test create movie
  t.test('POST /movies', async (t) => {
    const movieData = {
      code: 'TEST-001',
      title: 'Test Movie',
      magnet_link: 'magnet:?xt=urn:btih:test'
    }

    const res = await app.inject({
      method: 'POST',
      url: '/movies',
      payload: movieData
    })
    
    t.equal(res.statusCode, 201)
    const payload = JSON.parse(res.payload)
    t.equal(payload.success, true)
    t.equal(payload.data.code, movieData.code)
    t.equal(payload.data.title, movieData.title)
  })

  // Test get movie by ID
  t.test('GET /movies/:id', async (t) => {
    const res = await app.inject({
      url: '/movies/TEST-001'
    })
    t.equal(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    t.equal(payload.success, true)
    t.equal(payload.data.code, 'TEST-001')
  })

  // Test search movies
  t.test('GET /movies/search', async (t) => {
    const res = await app.inject({
      url: '/movies/search?code=TEST'
    })
    t.equal(res.statusCode, 200)
    const payload = JSON.parse(res.payload)
    t.equal(payload.success, true)
    t.type(payload.data, 'object')
  })
})
