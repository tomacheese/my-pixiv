import {
  WebSocketRequest,
  WebSocketRequestTypes,
  WebSocketResponse,
} from 'my-pixiv-types'
import WebSocket from 'ws'

export abstract class BaseWSRouter<
  Req extends WebSocketRequest,
  Res extends WebSocketResponse
> {
  private ws: WebSocket
  private type: WebSocketRequestTypes
  private rid: number
  protected data: Req['data']

  constructor(ws: WebSocket, request: Req) {
    this.ws = ws
    this.type = request.type
    this.rid = request.rid
    this.data = request.data
  }

  abstract validate(): boolean

  abstract execute(): Promise<void>

  protected send(data: Res['data']) {
    this.ws.send(
      JSON.stringify({
        status: true,
        rid: this.rid,
        type: this.type,
        data,
      })
    )
  }

  protected sendError(message: string) {
    this.ws.send(
      JSON.stringify({
        status: false,
        rid: this.rid,
        type: this.type,
        error: {
          message,
        },
      })
    )
  }
}
