import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from '@/base-router'
import fs from 'fs'
import { Pixiv } from '@/pixiv/pixiv'

/**
 * 画像取得 REST API
 */
export class ImagesRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (route, _opts, done) => {
        route.get('/:type/:id', this.routeGetImage.bind(this))
        done()
      },
      {
        prefix: '/api/images',
      }
    )
  }

  async routeGetImage(request: FastifyRequest, reply: FastifyReply) {
    const { type, id } = request.params as { type: string; id: string }
    const { url } = request.query as { url: string }

    // Check params and query
    if (!type || !id || !url) {
      reply.code(400).send({ message: 'Bad request' })
    }

    const path = await Pixiv.downloadImage(type, id, url)
    const extension = this.getExtension(url)

    if (!fs.existsSync(path)) {
      await reply.code(404).send({ message: 'Not found' })
      return
    }

    // ファイルを返す
    await reply.type(`image/${extension}`).send(fs.createReadStream(path))
  }

  public getExtension(url: string): string {
    const extension = url.split('.').pop() || null
    if (!extension) {
      throw new Error('Failed to get extension')
    }
    return extension
  }
}
