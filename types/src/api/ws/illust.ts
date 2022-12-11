import { PixivIllustItem } from '../../pixiv'
import { WebSocketBase } from './base'

/** イラスト取得リクエストモデル */
export interface GetIllustRequest extends WebSocketBase {
  type: 'getIllust'
  data: {
    illust_id: number
  }
}

/** イラスト取得レスポンスモデル */
export interface GetIllustResponse extends WebSocketBase {
  type: 'getIllust'
  data: {
    item: PixivIllustItem
  }
}

/** イラスト検索リクエストモデル */
export interface SearchIllustRequest extends WebSocketBase {
  type: 'searchIllust'
  data: {
    word: string
    search_item_count: number
  }
}

/** イラスト検索レスポンスモデル */
export interface SearchIllustResponse extends WebSocketBase {
  type: 'searchIllust'
  data: {
    items: PixivIllustItem[]
  }
}

/** おすすめイラスト取得リクエストモデル */
export interface RecommendedIllustRequest extends WebSocketBase {
  type: 'recommendedIllust'
  data: {
    next_url?: string
  }
}

/** おすすめイラスト取得レスポンスモデル */
export interface RecommendedIllustResponse extends WebSocketBase {
  type: 'recommendedIllust'
  data: {
    items: PixivIllustItem[]
    next_url: string
  }
}

/** イラストお気に入り追加リクエストモデル */
export interface AddIllustLikeRequest extends WebSocketBase {
  type: 'addIllustLike'
  data: {
    illust_id: number
  }
}

/** イラストお気に入り追加レスポンスモデル */
export interface AddIllustLikeResponse extends WebSocketBase {
  type: 'addIllustLike'
  data: {
    status: 'OK'
  }
}
