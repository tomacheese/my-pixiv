import { buildApp } from '@/server'
import { FastifyInstance } from 'fastify'
import {
  GetIllustRequest,
  GetIllustResponse,
  SearchIllustRequest,
  SearchIllustResponse,
  WebSocketError,
  WebSocketRequestTypes,
} from 'my-pixiv-types'
import { AddressInfo } from 'net'
import WebSocket, { MessageEvent } from 'ws'
import 'jest-extended'

describe('WebSocketIllust', () => {
  let app: FastifyInstance
  let ws: WebSocket

  beforeAll(async () => {
    app = buildApp()
    await app.listen()

    const addressInfo = app.server.address() as AddressInfo
    const port = addressInfo.port
    ws = new WebSocket(`ws://localhost:${port}/api/ws`)

    ws.addEventListener('message', (event) => {
      console.log(event.data.toString())
    })
  })

  afterAll(async () => {
    ws.close()
    await app.close()
  })

  it('接続確認', (done) => {
    ws.onopen = () => {
      done()
    }
  })

  it('getIllust (存在するイラスト)', (done) => {
    const rid = new Date().getTime()
    const type: WebSocketRequestTypes = 'getIllust'

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data.toString()) as GetIllustResponse
      if (data.type !== type) {
        return
      }

      ws.removeEventListener('message', handler)
      done()

      // 必須パラメータの存在確認
      expect(data.data).toHaveProperty('item')
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('title')
      expect(data.data).toHaveProperty('type')
      expect(data.data).toHaveProperty('image_urls')
      expect(data.data.image_urls).toHaveProperty('square_medium')
      expect(data.data.image_urls).toHaveProperty('medium')
      expect(data.data.image_urls).toHaveProperty('large')
      expect(data.data).toHaveProperty('caption')
      expect(data.data).toHaveProperty('restrict')
      expect(data.data).toHaveProperty('user')
      expect(data.data.user).toHaveProperty('id')
      expect(data.data.user).toHaveProperty('name')
      expect(data.data.user).toHaveProperty('account')
      expect(data.data.user).toHaveProperty('profile_image_urls')
      expect(data.data.user.profile_image_urls).toHaveProperty('medium')
      expect(data.data).toHaveProperty('tags')
      expect(data.data).toHaveProperty('tools')
      expect(data.data).toHaveProperty('create_date')
      expect(data.data).toHaveProperty('page_count')
      expect(data.data).toHaveProperty('width')
      expect(data.data).toHaveProperty('height')
      expect(data.data).toHaveProperty('sanity_level')
      expect(data.data).toHaveProperty('x_restrict')
      expect(data.data).toHaveProperty('series')
      expect(data.data).toHaveProperty('meta_single_page')
      expect(data.data.meta_single_page).toHaveProperty('original_image_url')
      expect(data.data).toHaveProperty('meta_pages')
      expect(data.data).toHaveProperty('total_view')
      expect(data.data).toHaveProperty('total_bookmarks')
      expect(data.data).toHaveProperty('is_bookmarked')
      expect(data.data).toHaveProperty('visible')
      expect(data.data).toHaveProperty('is_muted')
      expect(data.data).toHaveProperty('illust_ai_type')
      expect(data.data).toHaveProperty('illust_book_style')
      expect(data.data).toHaveProperty('comment_access_control')

      // パラメータ確認
      expect(data.data.id).toBe(103474796)
      expect(data.data.title).toBe('-')
      expect(data.data.type).toBe('illust')
      expect(data.data.image_urls.square_medium).toStartWith(
        'https://i.pximg.net/c/360x360_70/'
      )
      expect(data.data.image_urls.medium).toStartWith(
        'https://i.pximg.net/c/540x540_70/'
      )
      expect(data.data.image_urls.large).toStartWith(
        'https://i.pximg.net/c/600x1200_90/'
      )
      expect(data.data.caption).toBe('')
      expect(data.data.restrict).toBe(0)
      expect(data.data.user.id).toBe(6203904)
      expect(data.data.user.name).toBe('ttosom')
      expect(data.data.user.account).toBe('ttosom58')
      expect(data.data.user.profile_image_urls.medium).toStartWith(
        'https://i.pximg.net/user-profile/'
      )
      expect(data.data.tags).toBeArray()
      expect(data.data.tools).toBeArrayOfSize(0)
      expect(data.data.create_date).toBe('2022-12-10T00:00:15+09:00')
      expect(data.data.page_count).toBe(1)
      expect(data.data.width).toBe(900)
      expect(data.data.height).toBe(1373)
      expect(data.data.sanity_level).toBe(4)
      expect(data.data.x_restrict).toBe(0)
      expect(data.data.series).toBeNull()
      expect(data.data.meta_pages).toBeArrayOfSize(0)
      expect(data.data.total_view).toBeGreaterThan(48100)
      expect(data.data.total_bookmarks).toBeGreaterThan(14870)
      expect(data.data.visible).toBe(true)
      expect(data.data.is_muted).toBe(false)
      expect(data.data.total_comments).toBeGreaterThan(30)
      expect(data.data.illust_ai_type).toBe(1)
      expect(data.data.illust_book_style).toBe(0)
      expect(data.data.comment_access_control).toBe(0)
    }
    ws.addEventListener('message', handler)

    const request: GetIllustRequest = {
      type,
      rid,
      data: {
        illust_id: 103474796,
      },
    }
    ws.send(JSON.stringify(request))
  })

  it('getIllust (存在しないイラスト)', (done) => {
    const rid = new Date().getTime()
    const type: WebSocketRequestTypes = 'getIllust'

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data.toString()) as WebSocketError
      if (data.type !== type) {
        return
      }

      ws.removeEventListener('message', handler)
      done()

      // 存在しないので illust not found エラーが返るはず
      expect(data).toHaveProperty('error')
      expect(data.error).toHaveProperty('message')
      expect(data.error.message).toBe('illust not found')
    }
    ws.addEventListener('message', handler)

    const request: GetIllustRequest = {
      type,
      rid,
      data: {
        illust_id: 1,
      },
    }
    ws.send(JSON.stringify(request))
  })

  it('searchIllust', (done) => {
    const rid = new Date().getTime()
    const type: WebSocketRequestTypes = 'searchIllust'

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data.toString()) as SearchIllustResponse
      if (data.type !== type) {
        return
      }

      ws.removeEventListener('message', handler)
      done()

      // 必須パラメータの存在確認
      expect(data.data).toHaveProperty('items')
    }
    ws.addEventListener('message', handler)

    const request: SearchIllustRequest = {
      type,
      rid,
      data: {
        word: 'ホロライブ',
        search_item_count: 30,
      },
    }
    ws.send(JSON.stringify(request))
  })
})
