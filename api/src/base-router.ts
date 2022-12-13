import { FastifyInstance } from 'fastify'
import { Configuration } from './config'

/**
 * REST API ルーターの基底クラス
 */
export abstract class BaseRouter {
  protected fastify: FastifyInstance
  protected config: Configuration

  constructor(fastify: FastifyInstance, config: Configuration) {
    this.fastify = fastify
    this.config = config
  }

  /**
   * ルーターを初期化する
   *
   * this.fastify.register() でルーターを登録する
   */
  abstract init(): void
}
