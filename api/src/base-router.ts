import { FastifyInstance } from 'fastify'
import { Configuration } from './config'

export abstract class BaseRouter {
  protected fastify: FastifyInstance
  protected config: Configuration

  constructor(fastify: FastifyInstance, config: Configuration) {
    this.fastify = fastify
    this.config = config
  }

  abstract init(): void
}
