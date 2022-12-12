import { BaseWSRouter } from '@/base-ws-router'
import { ViewedApi } from '@/utils/viewed'
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
    return (
      !!this.data &&
      !!this.data.item_type &&
      (this.data.item_type === 'illust' || this.data.item_type === 'novel')
    )
  }

  async execute() {
    const viewedApi = ViewedApi.of()
    this.send({
      item_ids: viewedApi.get(this.data.item_type).map((item) => item.id),
    })
  }
}

export class AddViewed extends BaseWSRouter<
  AddViewedRequest,
  AddViewedResponse
> {
  validate(): boolean {
    return (
      !!this.data.item &&
      !!this.data.item.id &&
      !!this.data.item.type &&
      this.isVaildId(this.data.item.id) &&
      (this.data.item.type === 'illust' || this.data.item.type === 'novel')
    )
  }

  async execute() {
    const viewedApi = ViewedApi.of()
    viewedApi.add(
      this.data.item.type,
      this.data.item.id
    )
  }

  isVaildId(rawId: any) {
    return !Number.isNaN(parseInt(rawId, 10)) || parseInt(rawId, 10) < 0
  }
}
