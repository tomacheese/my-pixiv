import { PixivIllustItem } from '../../pixiv/pixivIllust'
import { PixivNovelItem } from '../../pixiv/pixivNovel'
import { WebSocketBase } from './base'

type PixivItem = PixivIllustItem | PixivNovelItem

/** マンガ取得リクエストモデル */
export interface GetMangaRequest extends WebSocketBase {
  type: 'getManga'
  data: {
    /**
     * マンガ ID
     */
    manga_id: number
  }
}

/** マンガ取得レスポンスモデル */
export interface GetMangaResponse extends WebSocketBase {
  type: 'getManga'
  data: {
    /**
     * pixiv マンガアイテム (イラストと構造はおなじ)
     */
    item: PixivIllustItem
  }
}

/** マンガ検索リクエストモデル */
export interface SearchMangaRequest extends WebSocketBase {
  type: 'searchManga'
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

/** マンガ検索レスポンスモデル */
export interface SearchMangaResponse extends WebSocketBase {
  type: 'searchManga'
  data: {
    /**
     * 検索結果のマンガアイテム
     */
    items: PixivIllustItem[]
  }
}

/** おすすめマンガ取得リクエストモデル */
export interface RecommendedMangaRequest extends WebSocketBase {
  type: 'recommendedManga'
  data: {
    /**
     * 次のページの URL
     */
    next_url?: string
  }
}

/** おすすめマンガ取得レスポンスモデル */
export interface RecommendedMangaResponse extends WebSocketBase {
  type: 'recommendedManga'
  data: {
    /**
     * おすすめマンガアイテム
     */
    items: PixivItem[]

    /**
     * 次のページの URL
     */
    next_url: string
  }
}

/** マンガお気に入り追加リクエストモデル */
export interface AddMangaLikeRequest extends WebSocketBase {
  type: 'addMangaLike'
  data: {
    /**
     * マンガ ID
     */
    manga_id: number
  }
}

/** マンガお気に入り追加レスポンスモデル */
export interface AddMangaLikeResponse extends WebSocketBase {
  type: 'addMangaLike'
}
