import fastify from 'fastify'
import fastifyWebSocket from '@fastify/websocket'
import { BaseRouter } from '@/base-router'
import { RootRouter } from '@/routes/root'
import { ImagesRouter } from './routes/images'
import { WebSocketRouter } from './routes/websocket'
import { Configuration } from './config'
import { PATH } from './utils/utils'

export function buildApp() {
  const app = fastify()
  app.register(fastifyWebSocket)

  const configPath = PATH.CONFIG_FILE
  const config = new Configuration(configPath)

  // routers
  const routers: BaseRouter[] = [
    new RootRouter(app, config),
    new ImagesRouter(app, config),
    new WebSocketRouter(app, config),
  ]

  routers.forEach((router) => {
    console.log(`Initializing route: ${router.constructor.name}`)
    router.init()
  })

  return app
}
