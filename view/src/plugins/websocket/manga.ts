import {
  GetMangaResponse,
  GetMangaRequest,
  SearchMangaResponse,
  SearchMangaRequest,
  RecommendedMangaResponse,
  RecommendedMangaRequest,
  AddMangaLikeResponse,
  AddMangaLikeRequest,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

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
