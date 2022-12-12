import { PixivIllustItem } from '../../pixiv/pixivIllust'
import { PixivNovelItem } from '../../pixiv/pixivNovel'
import { WebSocketBase } from './base'

type PixivItem = PixivIllustItem | PixivNovelItem

/** マンガ取得リクエストモデル */
export interface GetMangaRequest extends WebSocketBase {
  type: 'getManga'
  data: {
    manga_id: number
  }
}

/** マンガ取得レスポンスモデル */
export interface GetMangaResponse extends WebSocketBase {
  type: 'getManga'
  data: {
    item: PixivIllustItem
  }
}

/** マンガ検索リクエストモデル */
export interface SearchMangaRequest extends WebSocketBase {
  type: 'searchManga'
  data: {
    word: string
    search_item_count: number
  }
}

/** マンガ検索レスポンスモデル */
export interface SearchMangaResponse extends WebSocketBase {
  type: 'searchManga'
  data: {
    items: PixivIllustItem[]
  }
}

/** おすすめマンガ取得リクエストモデル */
export interface RecommendedMangaRequest extends WebSocketBase {
  type: 'recommendedManga'
  data: {
    next_url?: string
  }
}

/** おすすめマンガ取得レスポンスモデル */
export interface RecommendedMangaResponse extends WebSocketBase {
  type: 'recommendedManga'
  data: {
    items: PixivItem[]
    next_url: string
  }
}

/** マンガお気に入り追加リクエストモデル */
export interface AddMangaLikeRequest extends WebSocketBase {
  type: 'addMangaLike'
  data: {
    manga_id: number
  }
}

/** マンガお気に入り追加レスポンスモデル */
export interface AddMangaLikeResponse extends WebSocketBase {
  type: 'addMangaLike'
}
