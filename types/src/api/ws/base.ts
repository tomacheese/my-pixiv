import {
  GetIllustRequest,
  SearchIllustRequest,
  RecommendedIllustRequest,
  AddIllustLikeRequest,
  AddIllustLikeResponse,
  GetIllustResponse,
  RecommendedIllustResponse,
  SearchIllustResponse,
} from './illust'
import {
  GetItemMuteRequest,
  AddItemMuteRequest,
  RemoveItemMuteRequest,
  AddItemMuteResponse,
  GetItemMuteResponse,
  RemoveItemMuteResponse,
  ShareAddItemMuteResponse,
  ShareRemoveItemMuteResponse,
} from './item-mute'
import {
  GetMangaRequest,
  SearchMangaRequest,
  RecommendedMangaRequest,
  AddMangaLikeRequest,
  GetMangaResponse,
  SearchMangaResponse,
  RecommendedMangaResponse,
  AddMangaLikeResponse,
} from './manga'
import {
  GetNovelRequest,
  SearchNovelRequest,
  RecommendedNovelRequest,
  GetNovelResponse,
  SearchNovelResponse,
  RecommendedNovelResponse,
  GetNovelSeriesRequest,
  GetNovelSeriesResponse,
} from './novel'
import { PingRequest, PingResponse } from './ping'
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
} from './twitter'
import { GetUserRequest, GetUserResponse } from './user'
import {
  AddViewedRequest,
  AddViewedResponse,
  GetViewedRequest,
  GetViewedResponse,
  ShareAddViewedResponse,
} from './viewed'

/** WebSocket リクエスト種別(エンドポイント)ごとのリクエスト・レスポンスモデル紐付け */
export type WebSocketEndPoint = {
  // illusts.ts
  getIllust: {
    request: GetIllustRequest
    response: GetIllustResponse
  }
  searchIllust: {
    request: SearchIllustRequest
    response: SearchIllustResponse
  }
  recommendedIllust: {
    request: RecommendedIllustRequest
    response: RecommendedIllustResponse
  }
  addIllustLike: {
    request: AddIllustLikeRequest
    response: AddIllustLikeResponse
  }
  // item-mute.ts
  getItemMute: {
    request: GetItemMuteRequest
    response: GetItemMuteResponse
  }
  addItemMute: {
    request: AddItemMuteRequest
    response: AddItemMuteResponse
  }
  removeItemMute: {
    request: RemoveItemMuteRequest
    response: RemoveItemMuteResponse
  }
  // manga.ts
  getManga: {
    request: GetMangaRequest
    response: GetMangaResponse
  }
  searchManga: {
    request: SearchMangaRequest
    response: SearchMangaResponse
  }
  recommendedManga: {
    request: RecommendedMangaRequest
    response: RecommendedMangaResponse
  }
  addMangaLike: {
    request: AddMangaLikeRequest
    response: AddMangaLikeResponse
  }
  // novel.ts
  getNovel: {
    request: GetNovelRequest
    response: GetNovelResponse
  }
  searchNovel: {
    request: SearchNovelRequest
    response: SearchNovelResponse
  }
  recommendedNovel: {
    request: RecommendedNovelRequest
    response: RecommendedNovelResponse
  }
  getNovelSeries: {
    request: GetNovelSeriesRequest
    response: GetNovelSeriesResponse
  }
  // ping.ts
  ping: {
    request: PingRequest
    response: PingResponse
  }
  // twitter.ts
  searchTweet: {
    request: SearchTweetRequest
    response: SearchTweetResponse
  }
  checkShadowBan: {
    request: CheckShadowBanRequest
    response: CheckShadowBanResponse
  }
  getTweetsLike: {
    request: GetTweetsLikeRequest
    response: GetTweetsLikeResponse
  }
  addTweetLike: {
    request: AddTweetLikeRequest
    response: AddTweetLikeResponse
  }
  removeTweetLike: {
    request: RemoveTweetLikeRequest
    response: RemoveTweetLikeResponse
  }
  // user.ts
  getUser: {
    request: GetUserRequest
    response: GetUserResponse
  }
  // viewed.ts
  getViewed: {
    request: GetViewedRequest
    response: GetViewedResponse
  }
  addViewed: {
    request: AddViewedRequest
    response: AddViewedResponse
  }
  shareAddViewed: {
    request: AddViewedRequest
    response: AddViewedResponse
  }
}

/** share 系 */
export type WebSocketShares = {
  shareAddItemMute: ShareAddItemMuteResponse
  shareRemoveItemMute: ShareRemoveItemMuteResponse
  shareAddViewed: ShareAddViewedResponse
}

export type WebSocketShareResponse = WebSocketShares[keyof WebSocketShares]

/** WebSocket のリクエストモデル一覧 */
export type WebSocketRequest =
  WebSocketEndPoint[keyof WebSocketEndPoint]['request']
/** WebSocket のレスポンスモデル一覧 */
export type WebSocketResponse =
  WebSocketEndPoint[keyof WebSocketEndPoint]['response']

/**
 * WebSocket でクライアント→サーバにリクエストされるリクエスト種別一覧
 * share*** はサーバ→クライアントのみ。
 */
export type WebSocketRequestTypes =
  // illusts.ts
  | 'getIllust'
  | 'searchIllust'
  | 'recommendedIllust'
  | 'addIllustLike'
  // item-mute.ts
  | 'getItemMute'
  | 'addItemMute'
  | 'removeItemMute'
  // manga.ts
  | 'getManga'
  | 'searchManga'
  | 'recommendedManga'
  | 'addMangaLike'
  // novel.ts
  | 'getNovel'
  | 'searchNovel'
  | 'recommendedNovel'
  | 'getNovelSeries'
  // ping.ts
  | 'ping'
  // twitter.ts
  | 'searchTweet'
  | 'checkShadowBan'
  | 'getTweetsLike'
  | 'addTweetLike'
  | 'removeTweetLike'
  // user.ts
  | 'getUser'
  // viewed.ts
  | 'getViewed'
  | 'addViewed'

/**
 * 基本リクエスト/レスポンスモデル
 */
export interface WebSocketBase {
  /** リクエスト種別 */
  type: WebSocketRequestTypes | keyof WebSocketShares
  /** リクエスト ID */
  rid: number
  /** データ */
  data: Record<string, any> | undefined
}

/**
 * エラーレスポンスモデル
 */
export interface WebSocketError {
  /** リクエスト種別 */
  type: WebSocketRequestTypes
  /** リクエスト ID */
  rid: number
  /** エラー */
  error: {
    /** エラーメッセージ */
    message: string
  }
}

export const isWebSocketError = (data: any): data is WebSocketError =>
  data.type !== undefined && data.rid !== undefined && data.error !== undefined
