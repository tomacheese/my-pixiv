import {
  GetNovelResponse,
  GetNovelRequest,
  SearchNovelResponse,
  SearchNovelRequest,
  GetNovelSeriesResponse,
  GetNovelSeriesRequest,
  RecommendedNovelResponse,
  RecommendedNovelRequest,
} from 'my-pixiv-types'
import { WSUtils } from '../websocket'

/**
 * my-pixiv WebSocket Novel API
 */
export class NovelAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * 小説を取得する
   *
   * @param novelId 小説ID
   * @returns 小説取得レスポンス
   */
  public get(novelId: number): Promise<GetNovelResponse> {
    return this.utils.request<GetNovelRequest, GetNovelResponse>('getNovel', {
      novel_id: novelId,
    })
  }

  /**
   * タグをもとに小説を検索する
   *
   * @param word 検索するワード。タグを指定する。複数指定する場合はスペース区切りで指定
   * @returns 検索結果レスポンス
   */
  public searchByTag(
    word: string,
    searchItemCount: number
  ): Promise<SearchNovelResponse> {
    return this.utils.request<SearchNovelRequest, SearchNovelResponse>(
      'searchNovel',
      {
        word,
        search_item_count: searchItemCount,
      }
    )
  }

  /**
   * 小説シリーズを取得する
   *
   * @param seriesId 小説シリーズID
   * @returns 小説シリーズ取得レスポンス
   */
  public getSeries(seriesId: number): Promise<GetNovelSeriesResponse> {
    return this.utils.request<GetNovelSeriesRequest, GetNovelSeriesResponse>(
      'getNovelSeries',
      {
        series_id: seriesId,
      }
    )
  }

  /**
   * おすすめ小説を取得する
   *
   * @param nextUrl 次のページのURL。初回は指定しない
   * @returns おすすめ小説レスポンス
   */
  public recommended(nextUrl?: string): Promise<RecommendedNovelResponse> {
    return this.utils.request<
      RecommendedNovelRequest,
      RecommendedNovelResponse
    >('recommendedNovel', {
      next_url: nextUrl,
    })
  }
}
