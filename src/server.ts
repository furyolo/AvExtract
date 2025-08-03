import Fastify from 'fastify'
import app from './app'

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
})

const start = async () => {
  try {
    await server.register(app)
    
    const port = parseInt(process.env.PORT || '3226', 10)
    const host = process.env.HOST || '0.0.0.0'
    
    await server.listen({ port, host })
    
    server.log.info(`Server listening on http://${host}:${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
