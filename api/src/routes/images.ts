import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from '@/base-router'
import { Pixiv } from '@/pixiv/pixiv'

/**
 * 画像取得 REST API
 */
export class ImagesRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (route, _opts, done) => {
        route.head('/:type/:id', this.routeHeadImage.bind(this))
        route.get('/:type/:id', this.routeGetImage.bind(this))
        done()
      },
      {
        prefix: '/api/images',
      }
    )
  }

  routeHeadImage(_request: FastifyRequest, reply: FastifyReply) {
    // cors
    this.responseCors(reply)
    reply.send()
  }

  async routeGetImage(request: FastifyRequest, reply: FastifyReply) {
    const { type, id } = request.params as { type: string; id: string }
    const { url } = request.query as { url: string }

    // Check params and query
    if (!type || !id || !url) {
      reply.code(400).send({ message: 'Bad request' })
    }

    const extension = this.getExtension(url)

    const response = await Pixiv.getAxiosImageStream(url)
    if (response.status !== 200 && response.status !== 404) {
      await reply.code(response.status).send({ message: response.data })
      throw new Error(`Failed to download image: ${url} (${response.status})`)
    }

    // ファイルを返す
    await reply.type(`image/${extension}`).send(response.data)
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

  public getExtension(url: string): string {
    const extension: string | undefined = url.split('.').pop()
    if (!extension) {
      throw new Error('Failed to get extension')
    }
    return extension
  }
}
