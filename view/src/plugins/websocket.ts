import { NuxtRuntimeConfig } from '@nuxt/types/config/runtime'
import WebSocket from 'ws'
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
  GetTweetLikeRequest,
  GetTweetLikeResponse,
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

export interface BaseRequest {
  type: string
}

export interface BaseResponse {
  type: string
  status: boolean
}

interface BaseErrorResponse {
  type: string
  status: false
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
  | GetUserRequest
  | SearchTweetRequest
  | CheckShadowBanRequest
  | GetTweetLikeRequest
  | AddTweetLikeRequest
  | RemoveTweetLikeRequest
  | GetItemMuteRequest
  | AddItemMuteRequest
  | RemoveItemMuteRequest
  | GetViewedRequest
  | AddViewedRequest
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
  | GetUserResponse
  | SearchTweetResponse
  | CheckShadowBanResponse
  | GetTweetLikeResponse
  | AddTweetLikeResponse
  | RemoveTweetLikeResponse
  | GetItemMuteResponse
  | AddItemMuteResponse
  | RemoveItemMuteResponse
  | GetViewedResponse
  | AddViewedResponse
  | ShareAddViewedResponse

export class IWebSocket {
  protected ws!: WebSocket

  constructor(ws: WebSocket | null) {
    if (ws) {
      this.ws = ws
    }
  }

  protected send(data: Request) {
    if (!this.ws) {
      throw new Error('WebSocket is not initialized')
    }
    this.ws.send(JSON.stringify(data))
  }

  protected request<Req extends Request, Res extends Response>(
    type: Req['type'],
    params?: Omit<Req, 'type'>
  ): Promise<Res> {
    return new Promise<Res>((resolve, reject) => {
      const event = (data: WebSocket.RawData) => {
        const response = JSON.parse(data.toString()) as BaseResponseWithError
        if (response.type !== type) {
          return
        }
        if (!response.status) {
          reject(new WebSocketAPIError('Request failed', response))
          return
        }
        resolve(response as Res)
      }
      this.ws.on('message', event)

      setTimeout(() => {
        reject(new Error('timeout'))
        this.ws.off('message', event)
      }, 10000)

      this.send({ type, ...params } as Req)
    })
  }
}

/**
 * my-pixiv WebSocket API
 */
export class WebSocketAPI extends IWebSocket {
  public illust!: IllustAPI
  public manga!: MangaAPI
  public novel!: NovelAPI
  public user!: UserAPI
  public twitter!: TwitterAPI
  public itemMute!: ItemMuteAPI
  public viewed!: ViewedAPI

  constructor(
    $config: NuxtRuntimeConfig,
    private $accessor: Context['$accessor']
  ) {
    super(null)
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const domain =
      $config.baseURL === '/'
        ? `${location.host}/`
        : $config.baseURL.replace(/https?:\/\//, '')

    this.connect(`${protocol}://${domain}api/ws`)
  }

  private connect(url?: string) {
    if (!url && !this.ws) {
      throw new Error('url is required')
    }

    this.ws = new WebSocket(url ?? this.ws.url)
    this.ws.onopen = this.onOpen
    this.ws.onclose = this.onClose
    this.ws.onmessage = this.onMessage

    this.illust = new IllustAPI(this.ws)
    this.manga = new MangaAPI(this.ws)
    this.novel = new NovelAPI(this.ws)
    this.user = new UserAPI(this.ws)
    this.twitter = new TwitterAPI(this.ws)
    this.itemMute = new ItemMuteAPI(this.ws)
  }

  private onOpen() {
    console.log('[WebSocket] connected')
  }

  private onClose(event: WebSocket.CloseEvent) {
    console.log('[WebSocket] closed', event.code, event.reason)

    setTimeout(() => {
      console.log('[WebSocket] reconnecting...')
      this.connect()
    })
  }

  private onMessage(event: WebSocket.MessageEvent) {
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
        if (!this.$accessor.settings.isAutoSyncMutes) return
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
  constructor(e: string, public data: any) {
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
  api = new WebSocketAPI(context.$config, context.$accessor)
  inject('api', api)
}

export function getAPI() {
  return api
}

export default websocketPlugin
