import { FastifyReply, FastifyRequest } from 'fastify'
import { BaseRouter } from '@/base-router'
import { PATH } from '@/utils'
import { dirname, join } from 'path'
import fs from 'fs'
import axios from 'axios'

export class ImagesRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (route, _opts, done) => {
        route.get('/:type/:id', this.routeGetImage.bind(this))
        done()
      },
      {
        prefix: '/images',
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

    const extension = this.getExtension(url)
    const path = this.getPath(type, id, url)

    fs.mkdirSync(dirname(path), { recursive: true })

    // なければダウンロード
    if (!fs.existsSync(path)) {
      await new Promise<void>((resolve, reject) => {
        axios
          .get(url, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
              Referer: 'https://www.pixiv.net/',
            },
            responseType: 'stream',
          })
          .then((response) => {
            response.data.pipe(fs.createWriteStream(path))
            response.data.on('end', () => {
              resolve()
            })
          })
          .catch((error) => {
            if (error.response.status === 404) {
              reply.code(404).send({ message: 'Not found' })
              resolve()
            }
            reject(error)
          })
      })
    }

    if (!fs.existsSync(path)) {
      reply.code(404).send({ message: 'Not found' })
      return
    }

    // ファイルを返す
    await reply.type(`image/${extension}`).send(fs.createReadStream(path))
  }

  getPath(itemType: string, itemId: string, url: string) {
    const dir = PATH.IMAGE_CACHE_DIR
    const filename = this.getFileName(url)
    return join(dir, itemType, itemId, filename)
  }

  private getFileName(url: string): string {
    const size = this.getSize(url)
    if (!size) {
      throw new Error('Invalid size')
    }
    const extension = this.getExtension(url)
    if (!extension) {
      throw new Error('Invalid extension')
    }
    const page = this.getPage(url)
    const fileName = [size, page, extension].filter((v) => v).join('.')
    return fileName
  }

  private getSize(url: string): string | null {
    if (url.includes('img-original')) {
      return 'original'
    }
    const regex = /\d+x\d+/
    const match = url.match(regex)
    if (match) {
      return match[0]
    }
    return null
  }

  private getExtension(url: string): string | null {
    return url.split('.').pop() || null
  }

  private getPage(url: string): string | null {
    const regex = /p\d+/
    const match = url.match(regex)
    if (match) {
      return match[0]
    }
    return null
  }
}
