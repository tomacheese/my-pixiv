import { BaseWSRouter } from '@/base-ws-router'
import {
  AddViewedRequest,
  AddViewedResponse,
  GetViewedRequest,
  GetViewedResponse,
} from 'my-pixiv-types'

export class GetViewed extends BaseWSRouter<
  GetViewedRequest,
  GetViewedResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class AddViewed extends BaseWSRouter<
  AddViewedRequest,
  AddViewedResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}
