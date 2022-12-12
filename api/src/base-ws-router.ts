import {
  WebSocketRequest,
  WebSocketRequestTypes,
  WebSocketResponse,
  WebSocketShareResponse,
} from 'my-pixiv-types'
import WebSocket from 'ws'
import { Configuration } from './config'

export abstract class BaseWSRouter<
  Req extends WebSocketRequest,
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

  abstract validate(): boolean

  abstract execute(): Promise<void>

  protected send(data: Res['data']) {
    this.ws.send(
      JSON.stringify({
        rid: this.rid,
        type: this.type,
        data,
      })
    )
  }

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

  protected sendToAll<T extends WebSocketShareResponse>(
    type: T['type'],
    data: T['data']
  ) {
    this.ws.send(
      JSON.stringify({
        rid: this.rid,
        type,
        data,
      })
    )
  }
}
