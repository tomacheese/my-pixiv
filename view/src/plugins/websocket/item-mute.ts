import { Context } from '@nuxt/types'
import { BaseRequest, BaseResponse, WSUtils } from '../websocket'

export type MuteTargetType = 'ILLUST' | 'NOVEL' | 'USER'

export interface ItemMute {
  type: MuteTargetType
  id: number
}

/** アイテムミュート取得リクエストモデル */
export interface GetItemMuteRequest extends BaseRequest {
  type: 'getItemMute'
}

/** アイテムミュート取得レスポンスモデル */
export interface GetItemMuteResponse extends BaseResponse {
  type: 'addItemMute'
  items: ItemMute[]
}

/** アイテムミュート追加リクエストモデル */
export interface AddItemMuteRequest extends BaseRequest {
  type: 'addItemMute'
  item: ItemMute
}

/** アイテムミュート追加レスポンスモデル */
export interface AddItemMuteResponse extends BaseResponse {
  type: 'addItemMute'
}

/** アイテムミュート削除リクエストモデル */
export interface RemoveItemMuteRequest extends BaseRequest {
  type: 'removeItemMute'
  item: ItemMute
}

/** アイテムミュート削除レスポンスモデル */
export interface RemoveItemMuteResponse extends BaseRequest {
  type: 'removeItemMute'
}

/** アイテムミュート追加シェアレスポンスモデル */
export interface ShareAddItemMuteResponse extends BaseResponse {
  type: 'shareAddItemMute'
  item: ItemMute
}

/** アイテムミュート削除シェアレスポンスモデル */
export interface ShareRemoveItemMuteResponse extends BaseResponse {
  type: 'shareRemoveItemMute'
  item: ItemMute
}

/**
 * my-pixiv WebSocket Item-Mute Sharing API
 */
export class ItemMuteAPI {
  private utils: WSUtils
  constructor(ws: WebSocket) {
    this.utils = new WSUtils(ws)
  }

  /**
   * ミュートしているアイテムを取得する
   *
   * @returns アイテムミュート取得レスポンス
   */
  public get(): Promise<GetItemMuteResponse> {
    return this.utils.request<GetItemMuteRequest, GetItemMuteResponse>(
      'getItemMute'
    )
  }

  /**
   * アイテムをミュートする
   *
   * @param item ミュートするアイテム
   * @returns アイテムミュート追加レスポンス
   */
  public add(item: ItemMute): Promise<AddItemMuteResponse> {
    return this.utils.request<AddItemMuteRequest, AddItemMuteResponse>(
      'addItemMute',
      {
        item,
      }
    )
  }

  /**
   * アイテムのミュートを解除する
   *
   * @param item ミュートを解除するアイテム
   * @returns アイテムミュート削除レスポンス
   */
  public remove(item: ItemMute): Promise<RemoveItemMuteResponse> {
    return this.utils.request<RemoveItemMuteRequest, RemoveItemMuteResponse>(
      'removeItemMute',
      {
        item,
      }
    )
  }

  /**
   * アイテムミュート追加シェアイベント(shareAddItemMute)を受信したときの処理
   *
   * @param $accessor Vuexアクセサー
   * @param res アイテムミュート追加シェアレスポンス
   */
  public onAddItemMute(
    $accessor: Context['$accessor'],
    res: ShareAddItemMuteResponse
  ): void {
    if (!$accessor.settings.isAutoSyncMutes) return
    $accessor.itemMute.addMute({
      item: res.item,
      isSync: false,
    })
  }

  /**
   * アイテムミュート削除シェアイベント(shareRemoveItemMute)を受信したときの処理
   *
   * @param $accessor Vuexアクセサー
   * @param res アイテムミュート削除シェアレスポンス
   */
  public onRemoveItemMute(
    $accessor: Context['$accessor'],
    res: ShareRemoveItemMuteResponse
  ): void {
    if (!$accessor.settings.isAutoSyncMutes) return
    $accessor.itemMute.removeMute({
      item: res.item,
      isSync: false,
    })
  }
}
