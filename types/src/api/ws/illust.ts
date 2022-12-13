import { PixivIllustItem } from '../../pixiv/pixivIllust'
import { WebSocketBase } from './base'

/** イラスト取得リクエストモデル */
export interface GetIllustRequest extends WebSocketBase {
  type: 'getIllust'
  data: {
    /** イラスト ID */
    illust_id: number
  }
}

/** イラスト取得レスポンスモデル */
export interface GetIllustResponse extends WebSocketBase {
  type: 'getIllust'
  /** pixiv イラストアイテム */
  data: PixivIllustItem
}

/** イラスト検索リクエストモデル */
export interface SearchIllustRequest extends WebSocketBase {
  type: 'searchIllust'
  data: {
    /** 検索ワード */
    word: string

    /** 検索するアイテム数（1検索で30件。この値を30で割った分検索が実行される） */
    search_item_count: number
  }
}

/** イラスト検索レスポンスモデル */
export interface SearchIllustResponse extends WebSocketBase {
  type: 'searchIllust'
  data: {
    /**
     * 検索結果のイラストアイテム
     */
    items: PixivIllustItem[]
  }
}

/** おすすめイラスト取得リクエストモデル */
export interface RecommendedIllustRequest extends WebSocketBase {
  type: 'recommendedIllust'
  data: {
    /**
     * 次のページの URL
     */
    next_url?: string
  }
}

/** おすすめイラスト取得レスポンスモデル */
export interface RecommendedIllustResponse extends WebSocketBase {
  type: 'recommendedIllust'
  data: {
    /**
     * おすすめイラストアイテム
     */
    items: PixivIllustItem[]

    /**
     * 次のページの URL
     */
    next_url: string
  }
}

/** イラストお気に入り追加リクエストモデル */
export interface AddIllustLikeRequest extends WebSocketBase {
  type: 'addIllustLike'
  data: {
    /**
     * イラスト ID
     */
    illust_id: number
  }
}

/** イラストお気に入り追加レスポンスモデル */
export interface AddIllustLikeResponse extends WebSocketBase {
  type: 'addIllustLike'
}
