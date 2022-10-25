import { BaseRequest, BaseResponse, IWebSocket } from '../websocket'
import { PixivItem } from '@/types/pixivItem'

/** 小説取得リクエストモデル */
export interface GetNovelRequest extends BaseRequest {
  type: 'getNovel'
  novel_id: number
}

/** 小説取得レスポンスモデル */
export interface GetNovelResponse extends BaseResponse {
  type: 'getNovel'
  item: PixivItem
}

/** 小説検索リクエストモデル */
export interface SearchNovelRequest extends BaseRequest {
  type: 'searchNovel'
  word: string
}

/** 小説検索レスポンスモデル */
export interface SearchNovelResponse extends BaseResponse {
  type: 'searchNovel'
  items: PixivItem[]
}

/** おすすめ小説取得リクエストモデル */
export interface RecommendedNovelRequest extends BaseRequest {
  type: 'recommendedNovel'
  next_url: string | null
}

/** おすすめ小説取得レスポンスモデル */
export interface RecommendedNovelResponse extends BaseResponse {
  type: 'recommendedNovel'
  items: PixivItem[]
  next_url: string
}

/**
 * my-pixiv WebSocket Novel API
 */
export class NovelAPI extends IWebSocket {
  /**
   * 小説を取得する
   *
   * @param novelId 小説ID
   * @returns 小説取得レスポンス
   */
  public get(novelId: number): Promise<GetNovelResponse> {
    return this.request<GetNovelRequest, GetNovelResponse>('getNovel', {
      novel_id: novelId,
    })
  }

  /**
   * タグをもとに小説を検索する
   *
   * @param word 検索するワード。タグを指定する。複数指定する場合はスペース区切りで指定
   * @returns 検索結果レスポンス
   */
  public searchByTag(word: string): Promise<SearchNovelResponse> {
    return this.request<SearchNovelRequest, SearchNovelResponse>(
      'searchNovel',
      {
        word,
      }
    )
  }

  /**
   * おすすめ小説を取得する
   *
   * @param nextUrl 次のページのURL。初回はnullを指定する
   * @returns おすすめ小説レスポンス
   */
  public recommended(
    nextUrl: string | null
  ): Promise<RecommendedNovelResponse> {
    return this.request<RecommendedNovelRequest, RecommendedNovelResponse>(
      'recommendedNovel',
      {
        next_url: nextUrl,
      }
    )
  }
}
