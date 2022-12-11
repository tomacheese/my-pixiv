import { Context, Plugin } from '@nuxt/types'
import {
  BaseErrorResponse,
  BaseResponseWithError,
  ShareAddItemMuteResponse,
  ShareAddViewedResponse,
  ShareRemoveItemMuteResponse,
  WebSocketRequest,
  WebSocketResponse,
} from 'my-pixiv-types'
import { IllustAPI } from './websocket/illust'
import { TwitterAPI } from './websocket/twitter'
import { MangaAPI } from './websocket/manga'
import { NovelAPI } from './websocket/novel'
import { UserAPI } from './websocket/user'
import { ItemMuteAPI } from './websocket/item-mute'
import { ViewedAPI } from './websocket/viewed'
import { PingAPI } from './websocket/ping'

export class WSUtils {
  protected ws!: WebSocket

  constructor(ws: WebSocket | null) {
    if (ws) {
      this.ws = ws
    }
  }

  public send(data: WebSocketRequest) {
    if (!this.ws) {
      throw new Error('WebSocket is not initialized')
    }
    this.ws.send(JSON.stringify(data))
  }

  public request<Req extends WebSocketRequest, Res extends WebSocketResponse>(
    type: Req['type'],
    params: Omit<Req, 'type'>
  ): Promise<Res> {
    if (!this.ws) {
      throw new Error('WebSocket is not initialized')
    }
    const rid = Date.now() / Math.random()
    return new Promise<Res>((resolve, reject) => {
      const event = (data: MessageEvent) => {
        const response = JSON.parse(data.data) as BaseResponseWithError
        if (response.type !== type || response.rid !== rid) {
          return
        }
        if (!response.status) {
          reject(
            new WebSocketAPIError(
              'Request failed',
              response as BaseErrorResponse
            )
          )
          return
        }
        resolve(response as unknown as Res)
      }
      this.ws.addEventListener('message', event)

      setTimeout(() => {
        reject(new Error('timeout'))
        this.ws.removeEventListener('message', event)
      }, 30000)

      if (this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.addEventListener('open', () => {
          this.ws.send(JSON.stringify({ rid, type, ...params }))
        })
      } else {
        this.ws.send(JSON.stringify({ rid, type, ...params }))
      }
    })
  }
}

/**
 * my-pixiv WebSocket API
 */
export class WebSocketAPI {
  private ws!: WebSocket
  private $accessor!: Context['$accessor']
  private $error: Context['error']

  private pingInterval: NodeJS.Timer | null = null
  public lastCloseEvent: CloseEvent | null = null

  public illust!: IllustAPI
  public manga!: MangaAPI
  public novel!: NovelAPI
  public user!: UserAPI
  public twitter!: TwitterAPI
  public itemMute!: ItemMuteAPI
  public viewed!: ViewedAPI
  public ping!: PingAPI

  constructor(context: Context) {
    const $config = context.$config
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const domain =
      $config.baseURL === '/'
        ? `${location.host}/`
        : $config.baseURL.replace(/https?:\/\//, '')
    this.$accessor = context.$accessor
    this.$error = context.error

    this.connect(`${protocol}://${domain}api/ws`)
  }

  public getReadyState():
    | WebSocket['OPEN']
    | WebSocket['CONNECTING']
    | WebSocket['CLOSED']
    | WebSocket['CLOSING'] {
    return this.ws.readyState
  }

  public getWS(): WebSocket {
    return this.ws
  }

  public reconnect() {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close()
    }
    this.connect()
  }

  private connect(url?: string) {
    if (!url && !this.ws) {
      throw new Error('url is required')
    }

    const password =
      this.$accessor.auth.password !== ''
        ? this.$accessor.auth.password
        : undefined
    this.ws = new WebSocket(url ?? this.ws.url, password)
    this.ws.addEventListener('open', this.onOpen.bind(this))
    this.ws.addEventListener('close', this.onClose.bind(this))
    this.ws.addEventListener('message', this.onMessage.bind(this))

    this.illust = new IllustAPI(this.ws)
    this.manga = new MangaAPI(this.ws)
    this.novel = new NovelAPI(this.ws)
    this.user = new UserAPI(this.ws)
    this.twitter = new TwitterAPI(this.ws)
    this.itemMute = new ItemMuteAPI(this.ws)
    this.viewed = new ViewedAPI(this.ws)
    this.ping = new PingAPI(this.ws)
  }

  private onOpen() {
    console.log('[WebSocket] connected')

    // 定期的にpingを送信
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    this.pingInterval = setInterval(() => {
      this.ping.ping().catch(() => {
        console.warn('[WebSocket] ping failed. reconnecting...')
        this.reconnect()
      })
    }, 30000)
    this.ws.addEventListener('close', () => {
      this.pingInterval && clearInterval(this.pingInterval)
    })

    // ViewedとItemMuteの同期
    if (this.$accessor.settings.isAutoSyncVieweds) {
      Promise.all([this.viewed.get('illust'), this.viewed.get('novel')])
        .then(([illust, novel]) => {
          this.$accessor.viewed.setAllVieweds({
            illusts: illust.item_ids,
            novels: novel.item_ids,
          })
          console.log('[WebSocket] Viewed synced')
        })
        .catch((e) => {
          console.error('[WebSocket] Viewed sync failed', e)
        })
    }
    if (this.$accessor.settings.isAutoSyncMutes) {
      this.itemMute
        .get()
        .then((mutes) => {
          this.$accessor.itemMute.setAllMutes(mutes)
          console.log('[WebSocket] ItemMute synced')
        })
        .catch((e) => {
          console.error('[WebSocket] ItemMute sync failed', e)
        })
    }
  }

  private onClose(event: CloseEvent) {
    console.log('[WebSocket] closed', event.code, event.reason)
    this.lastCloseEvent = event

    if (event.code === 1002) {
      // 1002: protocol error = authorization failed
      this.$error({
        message: 'WebSocket authorization failed',
        statusCode: 401,
      })
      return
    }

    setTimeout(() => {
      console.log('[WebSocket] reconnecting...')
      this.connect()
    }, 1000)
  }

  private onMessage(event: MessageEvent) {
    const data = JSON.parse(event.data.toString()) as BaseResponseWithError
    if (!data.status) {
      return
    }

    switch (data.type) {
      case 'shareAddItemMute':
        this.itemMute.onAddItemMute(
          this.$accessor,
          data as unknown as ShareAddItemMuteResponse
        )
        break
      case 'shareRemoveItemMute':
        this.itemMute.onRemoveItemMute(
          this.$accessor,
          data as unknown as ShareRemoveItemMuteResponse
        )
        break
      case 'shareAddViewed':
        this.viewed.onAddViewed(
          this.$accessor,
          data as unknown as ShareAddViewedResponse
        )
        break
    }
  }
}

export class WebSocketAPIError extends Error {
  constructor(e: string, public data: BaseErrorResponse) {
    super(e)
    this.name = new.target.name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// See https://typescript.nuxtjs.org/cookbook/plugins/

declare module 'vue/types/vue' {
  // this.$api inside Vue components
  interface Vue {
    $api: WebSocketAPI
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$api inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $api: WebSocketAPI
  }
  // nuxtContext.$api
  interface Context {
    $api: WebSocketAPI
  }
}

let api: WebSocketAPI | null = null
const websocketPlugin: Plugin = (context, inject) => {
  api = new WebSocketAPI(context)
  inject('api', api)
}

export function getAPI() {
  return api
}

export default websocketPlugin
