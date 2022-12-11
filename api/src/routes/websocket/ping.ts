import { BaseWSRouter } from '@/base-ws-router'
import { PingRequest, PingResponse } from 'my-pixiv-types'

export class PingPong extends BaseWSRouter<PingRequest, PingResponse> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}
