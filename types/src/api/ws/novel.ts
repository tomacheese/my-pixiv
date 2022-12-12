import { PixivNovelItem } from '../../pixiv/pixivNovel'
import { PixivNovelSeriesItem } from '../../pixiv/pixivNovelSeries'
import { WebSocketBase } from './base'

/** 小説取得リクエストモデル */
export interface GetNovelRequest extends WebSocketBase {
  type: 'getNovel'
  data: {
    novel_id: number
  }
}

/** 小説取得レスポンスモデル */
export interface GetNovelResponse extends WebSocketBase {
  type: 'getNovel'
  data: {
    item: PixivNovelItem
  }
}

/** 小説検索リクエストモデル */
export interface SearchNovelRequest extends WebSocketBase {
  type: 'searchNovel'
  data: {
    word: string
    search_item_count: number
  }
}

/** 小説検索レスポンスモデル */
export interface SearchNovelResponse extends WebSocketBase {
  type: 'searchNovel'
  data: {
    items: PixivNovelItem[]
  }
}

/** おすすめ小説取得リクエストモデル */
export interface RecommendedNovelRequest extends WebSocketBase {
  type: 'recommendedNovel'
  data: {
    next_url?: string
  }
}

/** おすすめ小説取得レスポンスモデル */
export interface RecommendedNovelResponse extends WebSocketBase {
  type: 'recommendedNovel'
  data: {
    items: PixivNovelItem[]
    next_url: string
  }
}

/** 小説シリーズ取得リクエストモデル */
export interface GetNovelSeriesRequest extends WebSocketBase {
  type: 'getNovelSeries'
  data: {
    series_id: number
  }
}

/** 小説シリーズ取得レスポンスモデル */
export interface GetNovelSeriesResponse extends WebSocketBase {
  type: 'getNovelSeries'
  data: {
    item: PixivNovelSeriesItem
  }
}
