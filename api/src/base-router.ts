import { FastifyInstance } from 'fastify'
import { Configuration } from './config'

export abstract class BaseRouter {
  public fastify: FastifyInstance
  public config: Configuration

  constructor(fastify: FastifyInstance, config: Configuration) {
    this.fastify = fastify
    this.config = config
  }

  abstract init(): void
}
