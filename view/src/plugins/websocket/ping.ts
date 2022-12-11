import { PingRequest, PingResponse } from 'my-pixiv-types'
import { WSUtils } from '../websocket'

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
