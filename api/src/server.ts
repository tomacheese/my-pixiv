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

  const isImageApiOnly = process.env.IMAGE_API_ONLY === 'true'
  if (isImageApiOnly) {
    console.log('Image API only mode')
  }

  // routers
  const routers: BaseRouter[] = [
    new RootRouter(app, config),
    new ImagesRouter(app, config),
    isImageApiOnly ? undefined : new WebSocketRouter(app, config),
    isImageApiOnly ? undefined : new SettingsSyncWebSocketRouter(app, config),
  ].filter((router) => router !== undefined) as BaseRouter[]

  for (const router of routers) {
    console.log(`Initializing route: ${router.constructor.name}`)
    router.init()
  }

  return app
}
