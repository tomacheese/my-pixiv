import { BaseWSRouter } from '@/base-ws-router'
import { PingRequest, PingResponse } from 'my-pixiv-types'

/**
 * ピンポン WebSocket API
 */
export class PingPong extends BaseWSRouter<PingRequest, PingResponse> {
  validate(): boolean {
    // 可変値無し
    return true
  }

  async execute() {
    this.send({})
  }
}
