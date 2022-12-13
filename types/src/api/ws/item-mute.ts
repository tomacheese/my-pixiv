import { WebSocketBase } from './base'

/** ミュートの対象種別 */
export type MuteTargetType = 'ILLUST' | 'NOVEL' | 'USER' | 'NOVEL_SERIES'

/**
 * アイテムミュートモデル
 */
export interface ItemMute {
  /**
   * ミュートの対象種別
   */
  type: MuteTargetType

  /**
   * ミュートの対象 ID
   */
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
    /**
     * アイテムミュートリスト
     */
    items: ItemMute[]
  }
}

/** アイテムミュート追加リクエストモデル */
export interface AddItemMuteRequest extends WebSocketBase {
  type: 'addItemMute'

  /**
   * アイテムミュート
   */
  data: ItemMute
}

/** アイテムミュート追加レスポンスモデル */
export interface AddItemMuteResponse extends WebSocketBase {
  type: 'addItemMute'
}

/** アイテムミュート削除リクエストモデル */
export interface RemoveItemMuteRequest extends WebSocketBase {
  type: 'removeItemMute'

  /**
   * アイテムミュート
   */
  data: ItemMute
}

/** アイテムミュート削除レスポンスモデル */
export interface RemoveItemMuteResponse extends WebSocketBase {
  type: 'removeItemMute'
}

/** アイテムミュート追加シェアレスポンスモデル */
export interface ShareAddItemMuteResponse extends WebSocketBase {
  type: 'shareAddItemMute'

  /**
   * アイテムミュート
   */
  data: ItemMute
}

/** アイテムミュート削除シェアレスポンスモデル */
export interface ShareRemoveItemMuteResponse extends WebSocketBase {
  type: 'shareRemoveItemMute'

  /**
   * アイテムミュート
   */
  data: ItemMute
}
