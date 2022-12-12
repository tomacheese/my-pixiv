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

export class AddItemMute extends BaseWSRouter<
  AddItemMuteRequest,
  AddItemMuteResponse
> {
  validate(): boolean {
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

    this.share()
  }

  isVaildId(rawId: any) {
    return !Number.isNaN(parseInt(rawId, 10)) || parseInt(rawId, 10) < 0
  }

  share() {
    this.sendToAll<ShareAddItemMuteResponse>('shareAddItemMute', this.data)
  }
}

export class RemoveItemMute extends BaseWSRouter<
  RemoveItemMuteRequest,
  RemoveItemMuteResponse
> {
  validate(): boolean {
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
