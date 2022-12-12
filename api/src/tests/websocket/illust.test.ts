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
      expect(data.data.item).toHaveProperty('id')
      expect(data.data.item).toHaveProperty('title')
      expect(data.data.item).toHaveProperty('type')
      expect(data.data.item).toHaveProperty('image_urls')
      expect(data.data.item.image_urls).toHaveProperty('square_medium')
      expect(data.data.item.image_urls).toHaveProperty('medium')
      expect(data.data.item.image_urls).toHaveProperty('large')
      expect(data.data.item).toHaveProperty('caption')
      expect(data.data.item).toHaveProperty('restrict')
      expect(data.data.item).toHaveProperty('user')
      expect(data.data.item.user).toHaveProperty('id')
      expect(data.data.item.user).toHaveProperty('name')
      expect(data.data.item.user).toHaveProperty('account')
      expect(data.data.item.user).toHaveProperty('profile_image_urls')
      expect(data.data.item.user.profile_image_urls).toHaveProperty('medium')
      expect(data.data.item).toHaveProperty('tags')
      expect(data.data.item).toHaveProperty('tools')
      expect(data.data.item).toHaveProperty('create_date')
      expect(data.data.item).toHaveProperty('page_count')
      expect(data.data.item).toHaveProperty('width')
      expect(data.data.item).toHaveProperty('height')
      expect(data.data.item).toHaveProperty('sanity_level')
      expect(data.data.item).toHaveProperty('x_restrict')
      expect(data.data.item).toHaveProperty('series')
      expect(data.data.item).toHaveProperty('meta_single_page')
      expect(data.data.item.meta_single_page).toHaveProperty(
        'original_image_url'
      )
      expect(data.data.item).toHaveProperty('meta_pages')
      expect(data.data.item).toHaveProperty('total_view')
      expect(data.data.item).toHaveProperty('total_bookmarks')
      expect(data.data.item).toHaveProperty('is_bookmarked')
      expect(data.data.item).toHaveProperty('visible')
      expect(data.data.item).toHaveProperty('is_muted')
      expect(data.data.item).toHaveProperty('illust_ai_type')
      expect(data.data.item).toHaveProperty('illust_book_style')
      expect(data.data.item).toHaveProperty('comment_access_control')

      // パラメータ確認
      expect(data.data.item.id).toBe(103474796)
      expect(data.data.item.title).toBe('-')
      expect(data.data.item.type).toBe('illust')
      expect(data.data.item.image_urls.square_medium).toStartWith(
        'https://i.pximg.net/c/360x360_70/'
      )
      expect(data.data.item.image_urls.medium).toStartWith(
        'https://i.pximg.net/c/540x540_70/'
      )
      expect(data.data.item.image_urls.large).toStartWith(
        'https://i.pximg.net/c/600x1200_90/'
      )
      expect(data.data.item.caption).toBe('')
      expect(data.data.item.restrict).toBe(0)
      expect(data.data.item.user.id).toBe(6203904)
      expect(data.data.item.user.name).toBe('ttosom')
      expect(data.data.item.user.account).toBe('ttosom58')
      expect(data.data.item.user.profile_image_urls.medium).toStartWith(
        'https://i.pximg.net/user-profile/'
      )
      expect(data.data.item.tags).toBeArray()
      expect(data.data.item.tools).toBeArrayOfSize(0)
      expect(data.data.item.create_date).toBe('2022-12-10T00:00:15+09:00')
      expect(data.data.item.page_count).toBe(1)
      expect(data.data.item.width).toBe(900)
      expect(data.data.item.height).toBe(1373)
      expect(data.data.item.sanity_level).toBe(4)
      expect(data.data.item.x_restrict).toBe(0)
      expect(data.data.item.series).toBeNull()
      expect(data.data.item.meta_pages).toBeArrayOfSize(0)
      expect(data.data.item.total_view).toBeGreaterThan(48100)
      expect(data.data.item.total_bookmarks).toBeGreaterThan(14870)
      expect(data.data.item.visible).toBe(true)
      expect(data.data.item.is_muted).toBe(false)
      expect(data.data.item.total_comments).toBeGreaterThan(30)
      expect(data.data.item.illust_ai_type).toBe(1)
      expect(data.data.item.illust_book_style).toBe(0)
      expect(data.data.item.comment_access_control).toBe(0)
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
