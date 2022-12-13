import { BaseRouter } from '@/base-router'
import { BaseWSRouter } from '@/base-ws-router'
import { Configuration } from '@/config'
import { websocketClients } from '@/utils/utils'
import { SocketStream } from '@fastify/websocket'
import { FastifyRequest } from 'fastify'
import {
  WebSocketRequest,
  WebSocketRequestTypes,
  WebSocketResponse,
} from 'my-pixiv-types'
import WebSocket from 'ws'
import {
  AddIllustLike,
  GetIllust,
  RecommendedIllust,
  SearchIllust,
} from './websocket/illust'
import { GetItemMute, AddItemMute, RemoveItemMute } from './websocket/item_mute'
import {
  GetManga,
  SearchManga,
  RecommendedManga,
  AddMangaLike,
} from './websocket/manga'
import {
  GetNovel,
  SearchNovel,
  RecommendedNovel,
  GetNovelSeries,
} from './websocket/novel'
import { PingPong } from './websocket/ping'
import {
  SearchTweet,
  CheckShadowBan,
  GetTweetsLike,
  AddTweetLike,
  RemoveTweetLike,
} from './websocket/twitter'
import { GetUser } from './websocket/user'
import { GetViewed, AddViewed } from './websocket/viewed'

const endpoints: {
  [key in WebSocketRequestTypes]: new (
    ws: WebSocket,
    config: Configuration,
    request: any
  ) => BaseWSRouter<WebSocketRequest, WebSocketResponse>
} = {
  getIllust: GetIllust,
  searchIllust: SearchIllust,
  recommendedIllust: RecommendedIllust,
  addIllustLike: AddIllustLike,
  getManga: GetManga,
  searchManga: SearchManga,
  recommendedManga: RecommendedManga,
  addMangaLike: AddMangaLike,
  getNovel: GetNovel,
  searchNovel: SearchNovel,
  recommendedNovel: RecommendedNovel,
  getNovelSeries: GetNovelSeries,
  getUser: GetUser,
  searchTweet: SearchTweet,
  checkShadowBan: CheckShadowBan,
  getTweetsLike: GetTweetsLike,
  addTweetLike: AddTweetLike,
  removeTweetLike: RemoveTweetLike,
  getViewed: GetViewed,
  addViewed: AddViewed,
  getItemMute: GetItemMute,
  addItemMute: AddItemMute,
  removeItemMute: RemoveItemMute,
  ping: PingPong,
}

export class WebSocketRouter extends BaseRouter {
  private wsKey: string | undefined

  init(): void {
    this.fastify.register((fastify, _, done) => {
      fastify.get('/api/ws', { websocket: true }, (connection, req) => {
        this.onOpen(connection, req)
        connection.socket.on('message', (message) =>
          this.onMessage(connection.socket, message)
        )
        connection.socket.addEventListener('close', this.onClose.bind(this))
        connection.socket.addEventListener('error', this.onError.bind(this))
      })
      done()
    })
  }

  onOpen(connection: SocketStream, req: FastifyRequest) {
    // 認証
    const configPassword = this.config.get('password')
    const inputPassword = req.headers['sec-websocket-protocol']

    if (configPassword) {
      if (inputPassword === undefined) {
        connection.socket.close(1002, 'Protocol required')
        return
      }
      if (inputPassword !== configPassword) {
        connection.socket.close(1002, 'Invalid password')
        return
      }
    }

    const key = req.headers['sec-websocket-key']
    if (key === undefined) {
      connection.socket.close(1002, 'Key required')
      return
    }

    this.wsKey = key
    console.log('Connected:', this.wsKey)

    websocketClients[this.wsKey] = connection.socket
  }

  onMessage(ws: WebSocket, data: WebSocket.RawData) {
    try {
      const json: WebSocketRequest = JSON.parse(data.toString())

      if (endpoints[json.type] === undefined) {
        throw new Error('Invalid type')
      }

      const router = new endpoints[json.type](ws, this.config, json)

      if (!router.validate()) {
        ws.send(
          JSON.stringify({
            rid: json.rid || undefined,
            type: json.type || undefined,
            error: {
              message: 'Invalid request',
            },
          })
        )
        return
      }

      router.execute().catch((error) => {
        console.error(error)
        ws.send(
          JSON.stringify({
            rid: json.rid || undefined,
            type: json.type || undefined,
            error: {
              message: String(error),
            },
          })
        )
      })
    } catch (error) {
      ws.send(
        JSON.stringify({
          error: {
            message: String(error),
          },
        })
      )
    }
  }

  onClose(event: WebSocket.CloseEvent) {
    console.log('onClose', this.wsKey, event.code, event.reason)

    if (this.wsKey) {
      delete websocketClients[this.wsKey]
    }
  }

  onError(event: WebSocket.ErrorEvent) {
    console.log('onError', event.error)
  }
}
