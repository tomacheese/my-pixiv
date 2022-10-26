import { BaseRequest, BaseResponse, WSUtils } from '../websocket'
import { PixivItem } from '@/types/pixivItem'

/** イラスト取得リクエストモデル */
export interface GetIllustRequest extends BaseRequest {
  type: 'getIllust'
  illust_id: number
}

/** イラスト取得レスポンスモデル */
export interface GetIllustResponse extends BaseResponse {
  type: 'getIllust'
  item: PixivItem
}

/** イラスト検索リクエストモデル */
export interface SearchIllustRequest extends BaseRequest {
  type: 'searchIllust'
  word: string
}

/** イラスト検索レスポンスモデル */
export interface SearchIllustResponse extends BaseResponse {
  type: 'searchIllust'
  items: PixivItem[]
}

/** おすすめイラスト取得リクエストモデル */
export interface RecommendedIllustRequest extends BaseRequest {
  type: 'recommendedIllust'
  next_url: string | null
}

/** おすすめイラスト取得レスポンスモデル */
export interface RecommendedIllustResponse extends BaseResponse {
  type: 'recommendedIllust'
  items: PixivItem[]
  next_url: string
}

/** イラストお気に入り追加リクエストモデル */
export interface AddIllustLikeRequest extends BaseRequest {
  type: 'addIllustLike'
  illust_id: number
}

/** イラストお気に入り追加レスポンスモデル */
export interface AddIllustLikeResponse extends BaseResponse {
  type: 'addIllustLike'
}

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
  public searchByTag(word: string): Promise<SearchIllustResponse> {
    return this.utils.request<SearchIllustRequest, SearchIllustResponse>(
      'searchIllust',
      {
        word,
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
