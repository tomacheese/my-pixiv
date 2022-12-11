import { BaseWSRouter } from '@/base-ws-router'
import {
  GetItemMuteRequest,
  AddItemMuteRequest,
  AddItemMuteResponse,
  GetItemMuteResponse,
  RemoveItemMuteResponse,
  RemoveItemMuteRequest,
} from 'my-pixiv-types'

export class GetItemMute extends BaseWSRouter<
  GetItemMuteRequest,
  GetItemMuteResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class AddItemMute extends BaseWSRouter<
  AddItemMuteRequest,
  AddItemMuteResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}

export class RemoveItemMute extends BaseWSRouter<
  RemoveItemMuteRequest,
  RemoveItemMuteResponse
> {
  validate(): boolean {
    return false
  }

  async execute() {
    console.log(this.data)
  }
}
