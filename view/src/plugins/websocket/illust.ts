import {
  AddIllustLikeRequest,
  AddIllustLikeResponse,
  GetIllustRequest,
  GetIllustResponse,
  RecommendedIllustRequest,
  RecommendedIllustResponse,
  SearchIllustRequest,
  SearchIllustResponse,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

/**
 * my-pixiv WebSocket Illust API
 */
export class IllustAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * イラストを取得する
   *
   * @param illustId イラストID
   * @returns イラスト取得レスポンス
   */
  public get(illustId: number): Promise<GetIllustResponse> {
    return this.utils.request<GetIllustRequest, GetIllustResponse>(
      'getIllust',
      {
        illust_id: illustId,
      }
    )
  }

  /**
   * タグをもとにイラストを検索する
   *
   * @param word 検索するワード。タグを指定する。複数指定する場合はスペース区切りで指定
   * @returns 検索結果レスポンス
   */
  public searchByTag(
    word: string,
    searchItemCount: number
  ): Promise<SearchIllustResponse> {
    return this.utils.request<SearchIllustRequest, SearchIllustResponse>(
      'searchIllust',
      {
        word,
        search_item_count: searchItemCount,
      }
    )
  }

  /**
   * おすすめイラストを取得する
   *
   * @param nextUrl 次のページのURL。初回はnullを指定する
   * @returns おすすめイラストレスポンス
   */
  public recommended(
    nextUrl: string | null
  ): Promise<RecommendedIllustResponse> {
    return this.utils.request<
      RecommendedIllustRequest,
      RecommendedIllustResponse
    >('recommendedIllust', {
      next_url: nextUrl,
    })
  }

  /**
   * イラストをお気に入りに追加する
   *
   * @param illustId イラストID
   * @returns 結果レスポンス
   */
  public addLike(illustId: number): Promise<AddIllustLikeResponse> {
    return this.utils.request<AddIllustLikeRequest, AddIllustLikeResponse>(
      'addIllustLike',
      {
        illust_id: illustId,
      }
    )
  }
}
