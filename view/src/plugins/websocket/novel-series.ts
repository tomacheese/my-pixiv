import { BaseRequest, BaseResponse, WSUtils } from '../websocket'
import { PixivNovelSeriesItem } from '@/types/pixivNovelSeries'

/** 小説シリーズ取得リクエストモデル */
export interface GetNovelSeriesRequest extends BaseRequest {
  type: 'getNovelSeries'
  series_id: number
}

/** 小説シリーズ取得レスポンスモデル */
export interface GetNovelSeriesResponse extends BaseResponse {
  type: 'getNovelSeries'
  item: PixivNovelSeriesItem
}

/**
 * my-pixiv WebSocket Novel-Series API
 */
export class NovelSeriesAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * 小説シリーズを取得する
   *
   * @param seriesId 小説シリーズID
   * @returns 小説シリーズ取得レスポンス
   */
  public get(seriesId: number): Promise<GetNovelSeriesResponse> {
    return this.utils.request<GetNovelSeriesRequest, GetNovelSeriesResponse>(
      'getNovelSeries',
      {
        series_id: seriesId,
      }
    )
  }
}
