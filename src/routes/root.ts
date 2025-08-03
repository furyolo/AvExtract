import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return {
      name: 'AV Movies API',
      version: '1.0.0',
      description: 'RESTful API for managing AV movies with PostgreSQL and Drizzle ORM',
      endpoints: {
        'POST /movies': 'Create a new movie',
        'GET /movies': 'Get all movies (with pagination)',
        'GET /movies/:code': 'Get movie by code',
        'PUT /movies/:code': 'Update movie by code',
        'DELETE /movies/:code': 'Delete movie by code',
        'GET /movies/search?code=xxx': 'Search movies by code'
      },
      status: 'running'
    }
  })

  // Health check endpoint
  fastify.get('/health', async function (request, reply) {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  })
}

export default root
