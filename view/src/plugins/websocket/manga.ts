import { BaseRequest, BaseResponse, WSUtils } from '../websocket'
import { PixivItem } from '@/types/pixivItem'
import { PixivIllustItem } from '@/types/pixivIllust'

/** マンガ取得リクエストモデル */
export interface GetMangaRequest extends BaseRequest {
  type: 'getManga'
  manga_id: number
}

/** マンガ取得レスポンスモデル */
export interface GetMangaResponse extends BaseResponse {
  type: 'getManga'
  item: PixivIllustItem
}

/** マンガ検索リクエストモデル */
export interface SearchMangaRequest extends BaseRequest {
  type: 'searchManga'
  word: string
  search_item_count: number
}

/** マンガ検索レスポンスモデル */
export interface SearchMangaResponse extends BaseResponse {
  type: 'searchManga'
  items: PixivIllustItem[]
}

/** おすすめマンガ取得リクエストモデル */
export interface RecommendedMangaRequest extends BaseRequest {
  type: 'recommendedManga'
  next_url: string | null
}

/** おすすめマンガ取得レスポンスモデル */
export interface RecommendedMangaResponse extends BaseResponse {
  type: 'recommendedManga'
  items: PixivItem[]
  next_url: string
}

/** マンガお気に入り追加リクエストモデル */
export interface AddMangaLikeRequest extends BaseRequest {
  type: 'addMangaLike'
  manga_id: number
}

/** マンガお気に入り追加レスポンスモデル */
export interface AddMangaLikeResponse extends BaseResponse {
  type: 'addMangaLike'
}

/**
 * my-pixiv WebSocket Manga API
 */
export class MangaAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * マンガを取得する
   *
   * @param mangaId マンガID
   * @returns マンガ取得レスポンス
   */
  public get(mangaId: number): Promise<GetMangaResponse> {
    return this.utils.request<GetMangaRequest, GetMangaResponse>('getManga', {
      manga_id: mangaId,
    })
  }

  /**
   * タグをもとにマンガを検索する
   *
   * @param word 検索するワード。タグを指定する。複数指定する場合はスペース区切りで指定
   * @returns 検索結果レスポンス
   */
  public searchByTag(
    word: string,
    searchItemCount: number
  ): Promise<SearchMangaResponse> {
    return this.utils.request<SearchMangaRequest, SearchMangaResponse>(
      'searchManga',
      {
        word,
        search_item_count: searchItemCount,
      }
    )
  }

  /**
   * おすすめマンガを取得する
   *
   * @param nextUrl 次のページのURL。初回はnullを指定する
   * @returns おすすめマンガレスポンス
   */
  public recommended(
    nextUrl: string | null
  ): Promise<RecommendedMangaResponse> {
    return this.utils.request<
      RecommendedMangaRequest,
      RecommendedMangaResponse
    >('recommendedManga', {
      next_url: nextUrl,
    })
  }

  /**
   * マンガをお気に入りに追加する
   *
   * @param mangaId マンガID
   * @returns 結果レスポンス
   */
  public addLike(mangaId: number): Promise<AddMangaLikeResponse> {
    return this.utils.request<AddMangaLikeRequest, AddMangaLikeResponse>(
      'addMangaLike',
      {
        manga_id: mangaId,
      }
    )
  }
}
