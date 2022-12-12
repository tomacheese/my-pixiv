import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from '@/base-router'

export class RootRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (route, _opts, done) => {
        route.get('/', this.routeGetRoot.bind(this))
        done()
      },
      { prefix: '/api' }
    )
  }

  routeGetRoot(_request: FastifyRequest, reply: FastifyReply) {
    reply.send({ message: 'my-pixiv api' })
  }
}
