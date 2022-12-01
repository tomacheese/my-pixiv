import { BaseRequest, BaseResponse, WSUtils } from '../websocket'

/** Pingリクエストモデル */
export interface PingRequest extends BaseRequest {
  type: 'ping'
}

/** Pingレスポンスモデル */
export interface PingResponse extends BaseResponse {
  type: 'ping'
}

/**
 * my-pixiv WebSocket Ping API
 */
export class PingAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * PING を送信する
   *
   * @returns PING レスポンス
   */
  public ping(): Promise<PingRequest> {
    return this.utils.request<PingRequest, PingResponse>('ping', {})
  }
}
