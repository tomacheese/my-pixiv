import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from '@/base-router'

/**
 * ルート REST API
 */
export class RootRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (route, _opts, done) => {
        route.head('/', this.routeHeadRoot.bind(this))
        route.get('/', this.routeGetRoot.bind(this))
        done()
      },
      { prefix: '/api' }
    )
  }

  routeHeadRoot(_request: FastifyRequest, reply: FastifyReply) {
    // cors
    this.responseCors(reply)
    reply.send()
  }

  routeGetRoot(_request: FastifyRequest, reply: FastifyReply) {
    // cors
    this.responseCors(reply)

    reply.send({
      message: 'my-pixiv api',
      isImageApiOnly: process.env.IMAGE_API_ONLY === 'true',
      // eslint-disable-next-line unicorn/no-null
      version: process.env.npm_package_version || null,
      // eslint-disable-next-line unicorn/no-null
      environment: process.env.NODE_ENV || null,
    })
  }

  responseCors(reply: FastifyReply) {
    reply.header('Access-Control-Allow-Origin', '*')
    reply.header(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE'
    )
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    reply.header('Access-Control-Allow-Credentials', 'true')
  }
}
