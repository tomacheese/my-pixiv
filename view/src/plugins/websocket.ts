import { Context, Plugin } from '@nuxt/types'
import {
  isWebSocketError,
  ShareAddItemMuteResponse,
  ShareAddViewedResponse,
  ShareRemoveItemMuteResponse,
  WebSocketError,
  WebSocketRequest,
  WebSocketResponse,
  WebSocketShareResponse,
} from 'my-pixiv-types'
import { IllustAPI } from './websocket/illust'
import { TwitterAPI } from './websocket/twitter'
import { MangaAPI } from './websocket/manga'
import { NovelAPI } from './websocket/novel'
import { UserAPI } from './websocket/user'
import { ItemMuteAPI } from './websocket/item-mute'
import { ViewedAPI } from './websocket/viewed'
import { PingAPI } from './websocket/ping'

/**
 * my-pixiv WebSocket Utils
 */
export class WSUtils {
  protected ws!: WebSocket

  constructor(ws: WebSocket) {
    if (ws) {
      this.ws = ws
    }
  }

  /**
   * リクエストを送信して、単一のレスポンスを受け取る
   *
   * @param type リクエストタイプ
   * @param data リクエストデータ
   * @returns レスポンス
   */
  public request<
    Request_ extends WebSocketRequest,
    Res extends WebSocketResponse
  >(type: Request_['type'], data: Request_['data']): Promise<Res> {
    if (!this.ws) {
      throw new Error('WebSocket is not initialized')
    }
    const rid = Date.now() / Math.random()
    return new Promise<Res>((resolve, reject) => {
      const event = (message: MessageEvent) => {
        const response = JSON.parse(message.data) as
          | WebSocketResponse
          | WebSocketError
        if (response.type !== type || response.rid !== rid) {
          return
        }
        if (isWebSocketError(response)) {
          reject(new WebSocketAPIError('Request failed', response))
          return
        }
        resolve(response as Res)
      }
      this.ws.addEventListener('message', event)

      setTimeout(() => {
        reject(new Error(`timeout (${type}#${rid})`))
        this.ws.removeEventListener('message', event)
      }, 30_000)

      if (this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.addEventListener('open', () => {
          this.ws.send(JSON.stringify({ rid, type, data }))
        })
      } else {
        this.ws.send(JSON.stringify({ rid, type, data }))
      }
    })
  }

  /**
   * リクエストを送信して、複数のレスポンスを受け取る
   *
   * @param type リクエストタイプ
   * @param data リクエストデータ
   * @param callback レスポンスを受け取ったときに呼び出されるコールバック
   * @param timeout タイムアウト時間(ms)
   */
  public requestMultiResponse<
    Request_ extends WebSocketRequest,
    Res extends WebSocketResponse
  >(
    type: Request_['type'],
    data: Request_['data'],
    callbackFunction: (response: Res) => void,
    errorFunction: (error: Error) => void,
    timeout = 30_000
  ) {
    if (!this.ws) {
      errorFunction(new Error('WebSocket is not initialized'))
    }
    const rid = Date.now() / Math.random()

    let responsed = false

    const event = (message: MessageEvent) => {
      const response = JSON.parse(message.data) as
        | WebSocketResponse
        | WebSocketError
      if (response.type !== type || response.rid !== rid) {
        return
      }
      responsed = true
      if (isWebSocketError(response)) {
        errorFunction(new WebSocketAPIError('Request failed', response))
      }
      callbackFunction(response as Res)
    }
    this.ws.addEventListener('message', event)

    setTimeout(() => {
      this.ws.removeEventListener('message', event)
      if (!responsed) {
        errorFunction(new Error(`timeout (${type}#${rid})`))
      }
    }, timeout)

    if (this.ws.readyState === WebSocket.CONNECTING) {
      this.ws.addEventListener('open', () => {
        this.ws.send(JSON.stringify({ rid, type, data }))
      })
    } else {
      this.ws.send(JSON.stringify({ rid, type, data }))
    }
  }
}

/**
 * my-pixiv WebSocket API
 */
export class WebSocketAPI {
  private ws!: WebSocket
  private $accessor!: Context['$accessor']
  private $error: Context['error']

  private pingInterval?: NodeJS.Timer = undefined
  public lastCloseEvent?: CloseEvent = undefined

  /** my-pixiv WebSocket Illust API */
  public illust!: IllustAPI
  /** my-pixiv WebSocket Manga API */
  public manga!: MangaAPI
  /** my-pixiv WebSocket Novel API */
  public novel!: NovelAPI
  /** my-pixiv WebSocket User API */
  public user!: UserAPI
  /** my-pixiv WebSocket Twitter API */
  public twitter!: TwitterAPI
  /** my-pixiv WebSocket ItemMute API */
  public itemMute!: ItemMuteAPI
  /** my-pixiv WebSocket Viewed API */
  public viewed!: ViewedAPI
  /** my-pixiv WebSocket Ping API */
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

  /**
   * WebSocket の接続状態を取得する
   *
   * @returns WebSocket の接続状態
   */
  public getReadyState():
    | WebSocket['OPEN']
    | WebSocket['CONNECTING']
    | WebSocket['CLOSED']
    | WebSocket['CLOSING'] {
    return this.ws.readyState
  }

  /**
   * WebSocket インスタンスを取得する
   *
   * @returns WebSocket インスタンス
   */
  public getWS(): WebSocket {
    return this.ws
  }

  /**
   * WebSocket を再接続する。
   *
   * - 接続中の場合は無視される
   * - 接続済みの場合は切断され再接続される
   */
  public reconnect() {
    if (this.ws.readyState === WebSocket.CONNECTING) {
      return
    }
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close()
    }
    this.connect()
  }

  /**
   * WebSocket を接続する
   *
   * @param url 接続先 URL。指定しない場合は現在の接続先を再利用する
   */
  private connect(url?: string) {
    if (!url && !this.ws) {
      throw new Error('url is required')
    }

    const password =
      this.$accessor.auth.password === ''
        ? undefined
        : this.$accessor.auth.password
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

    // 30秒ごとにpingを送信
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    this.pingInterval = setInterval(() => {
      this.ping.ping().catch(() => {
        console.warn('[WebSocket] ping failed. reconnecting...')
        this.reconnect()
      })
    }, 30_000)
    this.ws.addEventListener('close', () => {
      this.pingInterval && clearInterval(this.pingInterval)
    })

    // ViewedとItemMuteの同期
    if (this.$accessor.settings.isAutoSyncVieweds) {
      this.viewed
        .get()
        .then((response) => {
          this.$accessor.viewed.setItems(response.data.items)
          console.log('[WebSocket] Viewed synced')
        })
        .catch((error) => {
          console.error('[WebSocket] Viewed sync failed', error)
        })
    }
    if (this.$accessor.settings.isAutoSyncMutes) {
      this.itemMute
        .get()
        .then((mutes) => {
          this.$accessor.itemMute.setAllMutes(mutes.data)
          console.log('[WebSocket] ItemMute synced')
        })
        .catch((error) => {
          console.error('[WebSocket] ItemMute sync failed', error)
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
    const data = JSON.parse(event.data.toString()) as
      | WebSocketShareResponse
      | WebSocketError
    if (isWebSocketError(data)) {
      return
    }

    switch (data.type) {
      case 'shareAddItemMute': {
        this.itemMute.onAddItemMute(
          this.$accessor,
          data as ShareAddItemMuteResponse
        )
        break
      }
      case 'shareRemoveItemMute': {
        this.itemMute.onRemoveItemMute(
          this.$accessor,
          data as ShareRemoveItemMuteResponse
        )
        break
      }
      case 'shareAddViewed': {
        this.viewed.onAddViewed(this.$accessor, data as ShareAddViewedResponse)
        break
      }
    }
  }
}

/**
 * WebSocket API エラー
 */
export class WebSocketAPIError extends Error {
  constructor(e: string, public data: WebSocketError) {
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

let api: WebSocketAPI
const websocketPlugin: Plugin = (context, inject) => {
  api = new WebSocketAPI(context)
  inject('api', api)
}

/**
 * WebSocket API を取得する
 *
 * @returns WebSocket API
 */
export function getAPI() {
  return api
}

export default websocketPlugin
