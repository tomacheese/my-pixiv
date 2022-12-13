import {
  WebSocketRequest,
  WebSocketRequestTypes,
  WebSocketResponse,
  WebSocketShareResponse,
} from 'my-pixiv-types'
import WebSocket from 'ws'
import { Configuration } from './config'
import { websocketClients } from './utils/utils'

/**
 * WebSocket APIの基底クラス
 */
export abstract class BaseWSRouter<
  /** リクエストの型 */
  Req extends WebSocketRequest,
  /** レスポンスの型 */
  Res extends WebSocketResponse
> {
  private ws: WebSocket
  private type: WebSocketRequestTypes
  private rid: number
  protected config: Configuration
  protected data: Req['data']

  constructor(ws: WebSocket, config: Configuration, request: Req) {
    this.ws = ws
    this.config = config
    this.type = request.type
    this.rid = request.rid
    this.data = request.data
  }

  /**
   * リクエストのバリデーションを行う
   */
  abstract validate(): boolean

  /**
   * リクエストを処理する
   */
  abstract execute(): Promise<void>

  /**
   * レスポンスを送信する
   *
   * @param data レスポンスのデータ
   */
  protected send(data: Res['data']) {
    this.ws.send(
      JSON.stringify({
        rid: this.rid,
        type: this.type,
        data,
      })
    )
  }

  /**
   * エラーレスポンスを送信する
   *
   * @param message エラーメッセージ
   */
  protected sendError(message: string) {
    this.ws.send(
      JSON.stringify({
        rid: this.rid,
        type: this.type,
        error: {
          message,
        },
      })
    )
  }

  /**
   * 接続している全てのクライアントにレスポンスを送信する
   *
   * @param type レスポンス種別
   * @param data レスポンスデータ
   */
  protected sendToAll<T extends WebSocketShareResponse>(
    type: T['type'],
    data: T['data']
  ) {
    for (const ws of Object.values(websocketClients)) {
      if (ws.readyState !== WebSocket.OPEN) {
        continue
      }
      if (ws === this.ws) {
        continue
      }

      ws.send(
        JSON.stringify({
          rid: this.rid,
          type,
          data,
        })
      )
    }
  }
}
