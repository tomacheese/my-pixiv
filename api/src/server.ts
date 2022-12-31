import fastify, { FastifyInstance } from 'fastify'
import fastifyWebSocket from '@fastify/websocket'
import { BaseRouter } from '@/base-router'
import { RootRouter } from '@/routes/root'
import { ImagesRouter } from './routes/images'
import { WebSocketRouter } from './routes/websocket'
import { Configuration } from './config'
import { PATH } from './utils/utils'
import { SettingsSyncWebSocketRouter } from './routes/settings-sync'

/**
 * Fastify アプリケーションを構築する
 *
 * @returns Fastify アプリケーション
 */
export function buildApp(): FastifyInstance {
  const app = fastify()
  app.register(fastifyWebSocket)

  const configPath = PATH.CONFIG_FILE
  const config = new Configuration(configPath)

  // routers
  const routers: BaseRouter[] = [
    new RootRouter(app, config),
    new ImagesRouter(app, config),
    new WebSocketRouter(app, config),
    new SettingsSyncWebSocketRouter(app, config),
  ]

  for (const router of routers) {
    console.log(`Initializing route: ${router.constructor.name}`)
    router.init()
  }

  return app
}
