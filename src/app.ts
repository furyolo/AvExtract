import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Register Swagger documentation
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'AV Movies API',
        description: 'RESTful API for managing AV movies with PostgreSQL and Drizzle ORM',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@avmovies.api'
        }
      },
      servers: [
        {
          url: 'http://localhost:3226',
          description: 'Development server'
        }
      ],
      tags: [
        { name: 'movies', description: 'AV Movies management' },
        { name: 'health', description: 'Health check endpoints' }
      ]
    }
  })

  // Register Swagger UI
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header
  })

  // Register CORS plugin
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  })

  // Add logging configuration
  fastify.log.info('Starting AV Movies API server...')

  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // eslint-disable-next-line no-void
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app, options }
