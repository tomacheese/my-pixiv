import { BaseRequest, BaseResponse, IWebSocket } from '../websocket'
import { PixivItem } from '@/types/pixivItem'

/** マンガ取得リクエストモデル */
export interface GetMangaRequest extends BaseRequest {
  type: 'getManga'
  manga_id: number
}

/** マンガ取得レスポンスモデル */
export interface GetMangaResponse extends BaseResponse {
  type: 'getManga'
  item: PixivItem
}

/** マンガ検索リクエストモデル */
export interface SearchMangaRequest extends BaseRequest {
  type: 'searchManga'
  word: string
}

/** マンガ検索レスポンスモデル */
export interface SearchMangaResponse extends BaseResponse {
  type: 'searchManga'
  items: PixivItem[]
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
export class MangaAPI extends IWebSocket {
  /**
   * マンガを取得する
   *
   * @param mangaId マンガID
   * @returns マンガ取得レスポンス
   */
  public get(mangaId: number): Promise<GetMangaResponse> {
    return this.request<GetMangaRequest, GetMangaResponse>('getManga', {
      manga_id: mangaId,
    })
  }

  /**
   * タグをもとにマンガを検索する
   *
   * @param word 検索するワード。タグを指定する。複数指定する場合はスペース区切りで指定
   * @returns 検索結果レスポンス
   */
  public searchByTag(word: string): Promise<SearchMangaResponse> {
    return this.request<SearchMangaRequest, SearchMangaResponse>(
      'searchManga',
      {
        word,
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
    return this.request<RecommendedMangaRequest, RecommendedMangaResponse>(
      'recommendedManga',
      {
        next_url: nextUrl,
      }
    )
  }

  /**
   * マンガをお気に入りに追加する
   *
   * @param mangaId マンガID
   * @returns 結果レスポンス
   */
  public addLike(mangaId: number): Promise<AddMangaLikeResponse> {
    return this.request<AddMangaLikeRequest, AddMangaLikeResponse>(
      'addMangaLike',
      {
        manga_id: mangaId,
      }
    )
  }
}
