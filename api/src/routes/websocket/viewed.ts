import { BaseWSRouter } from '@/base-ws-router'
import { ViewedApi } from '@/utils/viewed'
import {
  AddViewedRequest,
  AddViewedResponse,
  GetViewedRequest,
  GetViewedResponse,
  ShareAddViewedResponse,
} from 'my-pixiv-types'

export class GetViewed extends BaseWSRouter<
  GetViewedRequest,
  GetViewedResponse
> {
  validate(): boolean {
    return true
  }

  async execute() {
    const viewedApi = ViewedApi.of()
    this.send({
      items: viewedApi.get(),
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
    viewedApi.add(this.data.item)

    this.send({})
    this.share()
  }

  isVaildId(rawId: any) {
    return !Number.isNaN(parseInt(rawId, 10)) || parseInt(rawId, 10) < 0
  }

  share() {
    this.sendToAll<ShareAddViewedResponse>('shareAddViewed', this.data)
  }
}
