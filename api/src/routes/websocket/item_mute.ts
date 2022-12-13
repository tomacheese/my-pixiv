import { BaseWSRouter } from '@/base-ws-router'
import { ItemMuteApi } from '@/utils/item-mute'
import {
  GetItemMuteRequest,
  AddItemMuteRequest,
  AddItemMuteResponse,
  GetItemMuteResponse,
  RemoveItemMuteResponse,
  RemoveItemMuteRequest,
  ShareAddItemMuteResponse,
  ShareRemoveItemMuteResponse,
} from 'my-pixiv-types'

/**
 * ミュートアイテム取得 WebSocket API
 */
export class GetItemMute extends BaseWSRouter<
  GetItemMuteRequest,
  GetItemMuteResponse
> {
  validate(): boolean {
    // 入力値無し
    return true
  }

  async execute() {
    const itemMuteApi = ItemMuteApi.of()
    this.send({
      items: itemMuteApi.get(),
    })
  }
}

/**
 * ミュートアイテム追加 WebSocket API
 */
export class AddItemMute extends BaseWSRouter<
  AddItemMuteRequest,
  AddItemMuteResponse
> {
  validate(): boolean {
    // type, id が必要。id は数値かつ1以上である必要がある
    return (
      !!this.data &&
      !!this.data.type &&
      !!this.data.id &&
      this.isVaildId(this.data.id)
    )
  }

  async execute() {
    const itemMuteApi = ItemMuteApi.of()
    itemMuteApi.add(this.data.type, this.data.id)

    this.send({})
    this.share()
  }

  isVaildId(rawId: any) {
    return !Number.isNaN(parseInt(rawId, 10)) || parseInt(rawId, 10) < 0
  }

  share() {
    this.sendToAll<ShareAddItemMuteResponse>('shareAddItemMute', this.data)
  }
}

/**
 * ミュートアイテム削除 WebSocket API
 */
export class RemoveItemMute extends BaseWSRouter<
  RemoveItemMuteRequest,
  RemoveItemMuteResponse
> {
  validate(): boolean {
    /// type, id が必要。id は数値かつ1以上である必要がある
    return (
      !!this.data &&
      !!this.data.type &&
      !!this.data.id &&
      this.isVaildId(this.data.id)
    )
  }

  async execute() {
    const itemMuteApi = ItemMuteApi.of()
    itemMuteApi.remove(this.data.type, this.data.id)

    this.send({})
    this.share()
  }

  isVaildId(rawId: any) {
    return !Number.isNaN(parseInt(rawId, 10)) || parseInt(rawId, 10) < 0
  }

  share() {
    this.sendToAll<ShareRemoveItemMuteResponse>(
      'shareRemoveItemMute',
      this.data
    )
  }
}
