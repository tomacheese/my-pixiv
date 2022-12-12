import { WebSocketBase } from './base'

export type MuteTargetType = 'ILLUST' | 'NOVEL' | 'USER' | 'NOVEL_SERIES'

export interface ItemMute {
  type: MuteTargetType
  id: number
}

/** アイテムミュート取得リクエストモデル */
export interface GetItemMuteRequest extends WebSocketBase {
  type: 'getItemMute'
}

/** アイテムミュート取得レスポンスモデル */
export interface GetItemMuteResponse extends WebSocketBase {
  type: 'getItemMute'
  data: {
    items: ItemMute[]
  }
}

/** アイテムミュート追加リクエストモデル */
export interface AddItemMuteRequest extends WebSocketBase {
  type: 'addItemMute'
  data: ItemMute
}

/** アイテムミュート追加レスポンスモデル */
export interface AddItemMuteResponse extends WebSocketBase {
  type: 'addItemMute'
}

/** アイテムミュート削除リクエストモデル */
export interface RemoveItemMuteRequest extends WebSocketBase {
  type: 'removeItemMute'
  data: ItemMute
}

/** アイテムミュート削除レスポンスモデル */
export interface RemoveItemMuteResponse extends WebSocketBase {
  type: 'removeItemMute'
}

/** アイテムミュート追加シェアレスポンスモデル */
export interface ShareAddItemMuteResponse extends WebSocketBase {
  type: 'shareAddItemMute'
  data: ItemMute
}

/** アイテムミュート削除シェアレスポンスモデル */
export interface ShareRemoveItemMuteResponse extends WebSocketBase {
  type: 'shareRemoveItemMute'
  data: ItemMute
}
