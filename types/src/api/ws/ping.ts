import { WebSocketBase } from './base'

/** Pingリクエストモデル */
export interface PingRequest extends WebSocketBase {
  type: 'ping'
}

/** Pingレスポンスモデル */
export interface PingResponse extends WebSocketBase {
  type: 'ping'
}
