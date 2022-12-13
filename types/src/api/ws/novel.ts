import { PixivNovelItem } from '../../pixiv/pixivNovel'
import { PixivNovelSeriesItem } from '../../pixiv/pixivNovelSeries'
import { WebSocketBase } from './base'

/** 小説取得リクエストモデル */
export interface GetNovelRequest extends WebSocketBase {
  type: 'getNovel'
  data: {
    /**
     * 小説 ID
     */
    novel_id: number
  }
}

/** 小説取得レスポンスモデル */
export interface GetNovelResponse extends WebSocketBase {
  type: 'getNovel'

  /**
   * pixiv 小説アイテム
   */
  data: PixivNovelItem
}

/** 小説検索リクエストモデル */
export interface SearchNovelRequest extends WebSocketBase {
  type: 'searchNovel'
  data: {
    /**
     * 検索ワード
     */
    word: string

    /**
     * 検索するアイテム数（1検索で30件。この値を30で割った分検索が実行される）
     */
    search_item_count: number
  }
}

/** 小説検索レスポンスモデル */
export interface SearchNovelResponse extends WebSocketBase {
  type: 'searchNovel'
  data: {
    /**
     * 検索結果の小説アイテム
     */
    items: PixivNovelItem[]
  }
}

/** おすすめ小説取得リクエストモデル */
export interface RecommendedNovelRequest extends WebSocketBase {
  type: 'recommendedNovel'
  data: {
    /**
     * 次のページの URL
     */
    next_url?: string
  }
}

/** おすすめ小説取得レスポンスモデル */
export interface RecommendedNovelResponse extends WebSocketBase {
  type: 'recommendedNovel'
  data: {
    /**
     * おすすめ小説アイテム
     */
    items: PixivNovelItem[]

    /**
     * 次のページの URL
     */
    next_url: string
  }
}

/** 小説シリーズ取得リクエストモデル */
export interface GetNovelSeriesRequest extends WebSocketBase {
  type: 'getNovelSeries'
  data: {
    /**
     * 小説シリーズ ID
     */
    series_id: number
  }
}

/** 小説シリーズ取得レスポンスモデル */
export interface GetNovelSeriesResponse extends WebSocketBase {
  type: 'getNovelSeries'

  /**
   * pixiv 小説シリーズアイテム
   */
  data: PixivNovelSeriesItem
}
