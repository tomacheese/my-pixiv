import { Context, Plugin } from '@nuxt/types'
import {
  AddIllustLikeRequest,
  AddIllustLikeResponse,
  GetIllustRequest,
  GetIllustResponse,
  IllustAPI,
  RecommendedIllustRequest,
  RecommendedIllustResponse,
  SearchIllustRequest,
  SearchIllustResponse,
} from './websocket/illust'
import {
  AddTweetLikeRequest,
  AddTweetLikeResponse,
  CheckShadowBanRequest,
  CheckShadowBanResponse,
  GetTweetsLikeRequest,
  GetTweetsLikeResponse,
  RemoveTweetLikeRequest,
  RemoveTweetLikeResponse,
  SearchTweetRequest,
  SearchTweetResponse,
  TwitterAPI,
} from './websocket/twitter'
import {
  SearchMangaRequest,
  RecommendedMangaRequest,
  SearchMangaResponse,
  RecommendedMangaResponse,
  MangaAPI,
  GetMangaRequest,
  GetMangaResponse,
  AddMangaLikeRequest,
  AddMangaLikeResponse,
} from './websocket/manga'
import {
  SearchNovelRequest,
  RecommendedNovelRequest,
  SearchNovelResponse,
  RecommendedNovelResponse,
  NovelAPI,
  GetNovelResponse,
  GetNovelRequest,
} from './websocket/novel'
import { GetUserRequest, GetUserResponse, UserAPI } from './websocket/user'
import {
  GetItemMuteRequest,
  AddItemMuteRequest,
  RemoveItemMuteRequest,
  GetItemMuteResponse,
  AddItemMuteResponse,
  RemoveItemMuteResponse,
  ItemMuteAPI,
  ShareAddItemMuteResponse,
  ShareRemoveItemMuteResponse,
} from './websocket/item-mute'
import {
  AddViewedRequest,
  AddViewedResponse,
  GetViewedRequest,
  GetViewedResponse,
  ShareAddViewedResponse,
  ViewedAPI,
} from './websocket/viewed'
import {
  GetNovelSeriesRequest,
  GetNovelSeriesResponse,
  NovelSeriesAPI,
} from './websocket/novel-series'
import { PingAPI, PingRequest, PingResponse } from './websocket/ping'

export interface BaseRequest {
  type: string
}

export interface BaseResponse {
  status: boolean
  rid: number
  type: string
}

interface BaseErrorResponse {
  status: false
  rid: number
  type: string
  code?: number
  message: string
}

type BaseResponseWithError = BaseResponse | BaseErrorResponse

export type Request =
  | GetIllustRequest
  | SearchIllustRequest
  | RecommendedIllustRequest
  | AddIllustLikeRequest
  | GetMangaRequest
  | SearchMangaRequest
  | RecommendedMangaRequest
  | AddMangaLikeRequest
  | GetNovelRequest
  | SearchNovelRequest
  | RecommendedNovelRequest
  | GetNovelSeriesRequest
  | GetUserRequest
  | SearchTweetRequest
  | CheckShadowBanRequest
  | GetTweetsLikeRequest
  | AddTweetLikeRequest
  | RemoveTweetLikeRequest
  | GetItemMuteRequest
  | AddItemMuteRequest
  | RemoveItemMuteRequest
  | GetViewedRequest
  | AddViewedRequest
  | PingRequest
export type Response =
  | GetIllustResponse
  | SearchIllustResponse
  | RecommendedIllustResponse
  | AddIllustLikeResponse
  | GetMangaResponse
  | SearchMangaResponse
  | RecommendedMangaResponse
  | AddMangaLikeResponse
  | GetNovelResponse
  | SearchNovelResponse
  | RecommendedNovelResponse
  | GetNovelSeriesResponse
  | GetUserResponse
  | SearchTweetResponse
  | CheckShadowBanResponse
  | GetTweetsLikeResponse
  | AddTweetLikeResponse
  | RemoveTweetLikeResponse
  | GetItemMuteResponse
  | AddItemMuteResponse
  | RemoveItemMuteResponse
  | GetViewedResponse
  | AddViewedResponse
  | ShareAddViewedResponse
  | PingResponse

export class WSUtils {
  protected ws!: WebSocket

  constructor(ws: WebSocket | null) {
    if (ws) {
      this.ws = ws
    }
  }

  public send(data: Request) {
    if (!this.ws) {
      throw new Error('WebSocket is not initialized')
    }
    this.ws.send(JSON.stringify(data))
  }

  public request<Req extends Request, Res extends Response>(
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
        resolve(response as Res)
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

  public illust!: IllustAPI
  public manga!: MangaAPI
  public novel!: NovelAPI
  public novelSeries!: NovelSeriesAPI
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
    this.ws.addEventListener('error', this.onError.bind(this))
    this.ws.addEventListener('message', this.onMessage.bind(this))

    this.illust = new IllustAPI(this.ws)
    this.manga = new MangaAPI(this.ws)
    this.novel = new NovelAPI(this.ws)
    this.novelSeries = new NovelSeriesAPI(this.ws)
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

  private onError(e: Event) {
    console.error('[WebSocket] error', e)

    this.$error({
      message: 'WebSocket error occurred',
      statusCode: 0,
    })
  }

  private onClose(event: CloseEvent) {
    console.log('[WebSocket] closed', event.code, event.reason)

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
          data as ShareAddItemMuteResponse
        )
        break
      case 'shareRemoveItemMute':
        this.itemMute.onRemoveItemMute(
          this.$accessor,
          data as ShareRemoveItemMuteResponse
        )
        break
      case 'shareAddViewed':
        this.viewed.onAddViewed(this.$accessor, data as ShareAddViewedResponse)
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

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $myInjectedFunction(message: string): void
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
