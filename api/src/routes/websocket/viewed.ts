import { BaseWSRouter } from '@/base-ws-router'
import { ViewedApi } from '@/utils/viewed'
import {
  AddViewedRequest,
  AddViewedResponse,
  GetViewedRequest,
  GetViewedResponse,
  ShareAddViewedResponse,
} from 'my-pixiv-types'

/**
 * 既読一覧取得 WebSocket API
 */
export class GetViewed extends BaseWSRouter<
  GetViewedRequest,
  GetViewedResponse
> {
  validate(): boolean {
    // 可変値無し
    return true
  }

  async execute() {
    const viewedApi = ViewedApi.of()
    this.send({
      items: viewedApi.get(),
    })
  }
}

/**
 * 既読追加 WebSocket API
 */
export class AddViewed extends BaseWSRouter<
  AddViewedRequest,
  AddViewedResponse
> {
  validate(): boolean {
    // itemが存在し、そのなかにidとtypeが存在し、idが数値かつ0以上であること
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
    return (
      !Number.isNaN(Number.parseInt(rawId, 10)) ||
      Number.parseInt(rawId, 10) < 0
    )
  }

  share() {
    this.sendToAll<ShareAddViewedResponse>('shareAddViewed', this.data)
  }
}
